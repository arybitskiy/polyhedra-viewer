import {
  useState,
  useLayoutEffect,
  RefObject,
  useEffect,
  useContext,
} from "react"
import Lore from "lore-engine"

import { Point } from "types"

import { DimensionsContext } from "../../context"
import useSolidContext from "./useSolidContext"

interface UseRotationConfig {
  fps: number
  secondsPerRotation: number
  fullRotation: number
  onTick?: (event: { tick: number; maxTicks: number }) => void
  x3dRef: RefObject<any>
  label: string
  viewVector: Point
}

const getCentroid = (vertices: number[][], index: number) =>
  vertices.map((vertex) => vertex[index]).reduce((acc, cur) => acc + cur, 0) /
  vertices.length

const multiplyQuaternions = (q: number[], r: number[]) => [
  r[0] * q[0] - r[1] * q[1] - r[2] * q[2] - r[3] * q[3],
  r[0] * q[1] + r[1] * q[0] - r[2] * q[3] + r[3] * q[2],
  r[0] * q[2] + r[1] * q[3] + r[2] * q[0] - r[3] * q[1],
  r[0] * q[3] - r[1] * q[2] + r[2] * q[1] + r[3] * q[0],
]

const calculateDot = (v1: Point, v2: Point) =>
  v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]

const hamiltonProduct = (q1: any, q2: any) => {
  const w1 = q1.components[3]
  const x1 = q1.components[0]
  const y1 = q1.components[1]
  const z1 = q1.components[2]

  const w2 = q2.components[3]
  const x2 = q2.components[0]
  const y2 = q2.components[1]
  const z2 = q2.components[2]

  return new Lore.Math.Quaternion(
    w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
    w1 * y2 + y1 * w2 + z1 * x2 - x1 * z2,
    w1 * z2 + z1 * w2 + x1 * y2 - y1 * x2,
    w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
  )
}

const calculateVertices = ({
  allVertices,
  faceVertices,
  viewVector,
  angle,
  delta,
  prevQuaternion,
}: {
  allVertices: Point[]
  faceVertices: Point[]
  viewVector: Point
  angle: number
  delta: number
  prevQuaternion?: any
}) => {
  const centroidX = getCentroid(faceVertices, 0)
  const centroidY = getCentroid(faceVertices, 1)
  const centroidZ = getCentroid(faceVertices, 2)
  const centroid: Point = [centroidX, centroidY, centroidZ]

  const centroidQuaternion = new Lore.Math.Quaternion(
    centroid[0],
    centroid[1],
    centroid[2],
    0,
  )
  const initialQuaternion = new Lore.Math.Quaternion(...viewVector, 0)
  const normalizedInitialQuaternion =
    prevQuaternion || Lore.Math.Quaternion.normalize(initialQuaternion)

  const rotationQuaternion = new Lore.Math.Quaternion(
    Math.sin(angle / 2) * viewVector[0],
    Math.sin(angle / 2) * viewVector[1],
    Math.sin(angle / 2) * viewVector[2],
    Math.cos(angle / 2),
  )
  const normalizedRotationQuaternion = Lore.Math.Quaternion.normalize(
    rotationQuaternion,
  )

  const multiplificationViewVectorAndCentroid = multiplyQuaternions(
    [0, ...viewVector],
    [0, ...centroid],
  )

  const a2L = Math.sqrt(
    Math.pow(viewVector[0], 2) +
      Math.pow(viewVector[1], 2) +
      Math.pow(viewVector[2], 2),
  )
  const centroidL = Math.sqrt(
    Math.pow(centroid[0], 2) +
      Math.pow(centroid[1], 2) +
      Math.pow(centroid[2], 2),
  )
  const dot = calculateDot(centroidQuaternion.components, viewVector)
  const Qw = Math.sqrt(Math.pow(a2L, 2) * Math.pow(centroidL, 2)) + dot

  const normalizedQuaternion = Lore.Math.Quaternion.normalize(
    new Lore.Math.Quaternion(
      multiplificationViewVectorAndCentroid[1],
      multiplificationViewVectorAndCentroid[2],
      multiplificationViewVectorAndCentroid[3],
      Qw,
    ),
  )

  const aplyingRotationQuaternion = multiplyQuaternions(
    [
      normalizedQuaternion.components[3],
      normalizedQuaternion.components[0],
      normalizedQuaternion.components[1],
      normalizedQuaternion.components[2],
    ],
    [
      normalizedRotationQuaternion.components[3],
      normalizedRotationQuaternion.components[0],
      normalizedRotationQuaternion.components[1],
      normalizedRotationQuaternion.components[2],
    ],
  )
  const afterRotationQuaternion = new Lore.Math.Quaternion(
    aplyingRotationQuaternion[1],
    aplyingRotationQuaternion[2],
    aplyingRotationQuaternion[3],
    aplyingRotationQuaternion[0],
  )

  const finalQuaternion = Lore.Math.Quaternion.slerp(
    normalizedInitialQuaternion,
    afterRotationQuaternion,
    delta,
  )

  return [
    finalQuaternion,
    allVertices.map((vertex) => {
      const vertexQuaternion = new Lore.Math.Quaternion(
        vertex[0],
        vertex[1],
        vertex[2],
        0,
      )
      const conjugatedQuaternion = Lore.Math.Quaternion.conjugate(
        finalQuaternion,
      )

      const multiplyQuaternionAndVertex = hamiltonProduct(
        vertexQuaternion,
        finalQuaternion,
      )

      const result = hamiltonProduct(
        conjugatedQuaternion,
        multiplyQuaternionAndVertex,
      )
      return [
        result.components[0],
        result.components[1],
        result.components[2],
      ] as Point
    }),
  ]
}

export default function useRotation({
  fps,
  secondsPerRotation,
  fullRotation,
  onTick,
  x3dRef,
  label,
  viewVector,
}: UseRotationConfig) {
  const angle = 0
  const { goNext } = useContext(DimensionsContext)
  const {
    solidData: { faces, vertices },
  } = useSolidContext()

  const maxTicks = fps * secondsPerRotation * faces.length
  const [tick, setTick] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const fixedTick = tick >= maxTicks ? maxTicks - 1 : tick

  const fromFace = Math.floor(fixedTick / (fps * secondsPerRotation))
  const toFace = fromFace + 1 === faces.length ? 0 : fromFace + 1

  const calc1 = calculateVertices({
    allVertices: vertices,
    faceVertices: faces[0].map((vertexIndex) => vertices[vertexIndex]),
    viewVector,
    angle,
    delta: 1,
  })
  let savedQuaternion = calc1[0]

  for (let i = 1; i <= fromFace; i++) {
    const calc2 = calculateVertices({
      allVertices: vertices,
      faceVertices: faces[i].map((vertexIndex) => vertices[vertexIndex]),
      viewVector,
      angle,
      delta: 1,
      prevQuaternion: savedQuaternion,
    })
    savedQuaternion = calc2[0]
  }

  const percent =
    (fixedTick - fromFace * fps * secondsPerRotation) /
    (fps * secondsPerRotation)
  const delta = percent

  const rotatedVertices = calculateVertices({
    allVertices: vertices,
    faceVertices: faces[toFace].map((vertexIndex) => vertices[vertexIndex]),
    viewVector,
    angle,
    delta,
    prevQuaternion: savedQuaternion,
  })[1]

  useLayoutEffect(() => {
    if (isLoaded) {
      if (tick < maxTicks) {
        setTimeout(() => {
          if (onTick) {
            onTick({ tick, maxTicks })
          }
          setTick((t) => t + 1)
        }, 1000 / fps)
      } else {
        goNext()
      }
    } else {
      setTimeout(() => {
        if (x3dRef.current && x3dRef.current.runtime) {
          // x3dRef.current.runtime.showAll()
          // x3dRef.current.runtime.fitObject(
          //   document.getElementById("cube-face-0"),
          // )
          setTimeout(() => {
            setIsLoaded(true)
          }, 2000)
        }
      }, 1000)
    }
  }, [
    setTick,
    tick,
    isLoaded,
    setIsLoaded,
    maxTicks,
    onTick,
    fps,
    x3dRef,
    goNext,
  ])

  useEffect(() => {
    setIsLoaded(false)
    setTick(0)
  }, [label])

  return {
    vertices: rotatedVertices,
  }
}
