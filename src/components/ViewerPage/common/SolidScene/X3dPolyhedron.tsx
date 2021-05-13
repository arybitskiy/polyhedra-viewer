import React, {
  useEffect,
  useRef,
  MouseEvent,
  useLayoutEffect,
  createRef,
} from "react"
import { isEqual, forEach } from "lodash-es"

import { Point } from "types"
import { SolidData } from "math/polyhedra"

// import face001 from "images/faces/face_001.jpg"
// import face002 from "images/faces/face_002.jpg"
// import face003 from "images/faces/face_003.jpg"
// import face004 from "images/faces/face_004.jpg"

import useCentroid from "./useCentroid"
import useTextureCoordinate from "./useTextureCoordinate"

const faces: string[] = []
// const faces = [face001, face002, face003, face004]

// Join a list of lists with an inner and outer separator.
function joinListOfLists<T>(list: T[][], outerSep: string, innerSep: string) {
  return list.map((elem) => elem.join(innerSep)).join(outerSep)
}
function joinList<T>(list: T[], innerSep: string) {
  return list.join(innerSep)
}

function colorArrayToRgb(color: number[]) {
  return `rgb(${color.map((num) => (num >= 1 ? 255 : Math.floor(num * 256)))})`
}

const Coordinates = ({ points }: { points: Point[] }) => {
  return (
    <coordinate
      is="x3d"
      data-testid="x3d-vertices"
      point={joinListOfLists(points, ", ", " ")}
    />
  )
}

/* Edges */

const Edges = ({
  edges = [],
  vertices = [],
}: Pick<SolidData, "edges" | "vertices">) => {
  return (
    <shape is="x3d">
      <indexedlineset is="x3d" coordindex={joinListOfLists(edges, " -1 ", " ")}>
        <Coordinates points={vertices} />
      </indexedlineset>
    </shape>
  )
}

/* Canvas */

const Canvas = ({
  text,
  color,
  index,
}: {
  text: string
  color: number[]
  index: number
}) => {
  const ref = useRef<any>(null)
  const imageRef = useRef<any>(null)
  const width = 1024
  const height = 1024

  useLayoutEffect(() => {
    if (ref.current && imageRef.current) {
      const ctx = ref.current.getContext("2d", { alpha: false })

      // ctx.drawImage(imageRef.current, 0, 0, width, height)

      ctx.globalAlpha = 0
      ctx.fillStyle = colorArrayToRgb(color)
      ctx.fillRect(0, 0, width, height)

      ctx.globalAlpha = 1
      ctx.fillStyle = "white"
      ctx.font = "400px serif"
      ctx.textBaseline = "middle"
      ctx.textAlign = "center"
      ctx.fillText(
        ["6", "9"].includes(text) ? `${text}.` : text,
        width / 2,
        height / 2,
      )
    }
  }, [ref, imageRef, text, color])

  return (
    <>
      <img
        alt="face"
        src={faces[index % faces.length]}
        ref={imageRef}
        style={{ display: "none" }}
      />
      <canvas
        width={width}
        height={height}
        ref={ref}
        style={{ display: "none", width: "200px", height: "200px" }}
      />
    </>
  )
}

interface X3dEvent extends MouseEvent {
  hitPnt: Point
  target: any
}

interface SolidConfig {
  showFaces: boolean
  showEdges: boolean
  showInnerFaces: boolean
  opacity: number
  textureAngle: string
}

interface Props {
  value: SolidData
  colors: number[][]
  config?: SolidConfig
  onHover?: (p: Point) => void
  onMouseOut?: () => void
  onClick?: (p: Point) => void
  vertices: Point[]
}

const defaultConfig = {
  showFaces: true,
  showEdges: true,
  showInnerFaces: true,
  opacity: 0.7,
  textureAngle: "0",
}

export default function X3dPolyhedron({
  value,
  colors,
  config = defaultConfig,
  onHover,
  onMouseOut,
  onClick,
  vertices,
}: Props) {
  const hitPnt = useRef<Point | null>(null)

  const { faces, edges, name } = value
  const { showFaces, showEdges, showInnerFaces, opacity, textureAngle } = config

  const listeners = {
    mousedown(e: X3dEvent) {
      hitPnt.current = e.hitPnt
    },
    mouseup(e: X3dEvent) {
      if (!isEqual(hitPnt.current, e.hitPnt)) return
      onClick?.(e.hitPnt)
    },
    mousemove(e: X3dEvent) {
      hitPnt.current = e.hitPnt
      onHover?.(e.hitPnt)
    },
    mouseout() {
      onMouseOut?.()
    },
  }

  const arrLength = faces.length
  const elRefs = React.useRef<any>([])

  if (elRefs.current.length !== arrLength) {
    // add or remove refs
    elRefs.current = Array(arrLength)
      .fill(null)
      .map((_, i) => elRefs.current[i] || createRef())
  }

  useEffect(() => {
    forEach(listeners, (fn, type) => {
      forEach(elRefs.current, ({ current }) => {
        if (current !== null) {
          current.addEventListener(type, fn)
        }
      })
    })

    return () => {
      forEach(listeners, (fn, type) => {
        forEach(elRefs.current, ({ current }) => {
          if (current !== null) {
            current.removeEventListener(type, fn)
          }
        })
      })
    }
  }, [listeners])

  const centroids = useCentroid()

  const textureCoordinates = useTextureCoordinate({
    rotationAngle: parseFloat(textureAngle as string),
  })

  return (
    <>
      {/* <transform is="x3d" translation="0 0 0">
        <shape is="x3d">
          <sphere is="x3d" radius="0.05" />
          <appearance is="x3d">
            <material is="x3d" diffuseColor="1.0 1.0 1.0" />
          </appearance>
        </shape>
      </transform> */}
      {/* {centroids.map((centroid, index) => (
        <transform
          is="x3d"
          translation={centroid.join(" ")}
          key={`centroid-${index}`}
        >
          <shape is="x3d">
            <sphere is="x3d" radius="0.05" />
            <appearance is="x3d">
              <material is="x3d" diffuseColor="0.0 1.0 1.0" />
            </appearance>
          </shape>
        </transform>
      ))} */}
      {showFaces &&
        faces.map((list, index) => (
          <shape
            is="x3d"
            data-testid="x3d-shape"
            ref={elRefs.current[index]}
            key={`${name}-face-${index}`}
            id={`${name}-face-${index}`}
          >
            <appearance is="x3d">
              <material is="x3d" transparency={1 - opacity} />
              {/* <imagetexture
                is="x3d"
                url="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Peach_Rinkysplash.jpg/800px-Peach_Rinkysplash.jpg"
              /> */}
              {/* <texturetransform is="x3d" scale="3,3" /> */}
              <texture is="x3d">
                <Canvas
                  text={(index + 1).toString()}
                  color={colors[index]}
                  index={index}
                />
                <textureproperties is="x3d" boundaryModeS="CLAMP_TO_EDGE" />
              </texture>
              {/* <texturetransform is="x3d" center="0.5 0.5" scale="1.1 1.1" /> */}
            </appearance>
            {/* <text string="This is a text">
              <fontstyle is="x3d" family="SANS" justify="MIDDLE" size="1.5" />
            </text> */}
            <indexedfaceset
              is="x3d"
              data-testid="x3d-faces"
              solid={(!showInnerFaces).toString()}
              colorpervertex="false"
              coordindex={joinList(list, " ")}
              texcoordindex={list.map((_, index) => index).join(" ")}
            >
              <Coordinates points={vertices} />
              <color is="x3d" color={joinList(colors[index], " ")} />
              <texturecoordinate
                is="x3d"
                point={textureCoordinates[index]
                  .map((point) => point.map((p) => p / 2 + 0.5).join(" "))
                  .join(" ")}
              ></texturecoordinate>
            </indexedfaceset>
          </shape>
        ))}
      {showEdges && <Edges edges={edges} vertices={vertices} />}
      {/* <shape is="x3d">
        <indexedlineset is="x3d" coordindex="0 1 -1">
          <coordinate is="x3d" point="0 0 0 0.5 0 0" />
        </indexedlineset>
      </shape>
      <shape is="x3d">
        <indexedlineset is="x3d" coordindex="0 1 -1">
          <coordinate is="x3d" point="0 0 0 0 1 0" />
        </indexedlineset>
      </shape>
      <shape is="x3d">
        <indexedlineset is="x3d" coordindex="0 1 -1">
          <coordinate is="x3d" point="0 0 0 0 0 1.5" />
        </indexedlineset>
      </shape> */}
    </>
  )
}
