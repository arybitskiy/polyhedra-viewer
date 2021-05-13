import { useMemo } from "react"
import turfCentroid from "@turf/centroid"
import { polygon as turfPolygon } from "@turf/helpers"

import { Point } from "types"

import useSolidContext from "./useSolidContext"

export default function useCentroid() {
  const {
    solidData: { vertices, faces },
  } = useSolidContext()

  return useMemo(
    () =>
      faces.map((list) => {
        const verts: Point[] = []
        list.forEach((vertixIndex) => verts.push(vertices[vertixIndex]))
        const projections = [
          [0, 1],
          [0, 2],
          [1, 2],
        ]
        const centroid: number[] = []

        projections.forEach(([dim1, dim2]) => {
          const points = verts.map((vertix) => [vertix[dim1], vertix[dim2]])
          const polygon = turfPolygon([[...points, points[0]]])
          const {
            geometry: {
              coordinates: [coord1, coord2],
            },
          } = turfCentroid(polygon)
          centroid[dim1] = coord1
          centroid[dim2] = coord2
        })

        return centroid as Point
      }),
    [faces, vertices],
  )
}
