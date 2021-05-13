import { useMemo } from "react"

import {
  angleBetween,
  vec,
  calculateDistanceToPointOnSquare,
  getCoords,
} from "math/geom"
import { Point } from "types"

import useSolidContext from "./useSolidContext"
import useCentroid from "./useCentroid"

interface UseTextureCoordinateConfig {
  rotationAngle?: number
}

export default function useTextureCoordinate({
  rotationAngle = 0,
}: UseTextureCoordinateConfig = {}) {
  const {
    solidData: { vertices, faces },
  } = useSolidContext()
  const centroids = useCentroid()

  return useMemo(
    () =>
      faces.map((list, index) => {
        const centroid = vec(centroids[index])
        const verts: Point[] = []
        list.forEach((vertixIndex) => verts.push(vertices[vertixIndex]))

        const initialVertex = verts[0]

        let prevAngle = 0
        const angles = verts.map((vertex, index) => {
          const angle =
            initialVertex === vertex
              ? 0
              : angleBetween(centroid, vec(verts[index - 1]), vec(vertex))
          prevAngle += angle
          return -prevAngle
        })

        const centroidToVertexDistances = verts.map((vertex) =>
          vec(vertex).distanceTo(centroid),
        )
        const maxDistance = Math.max(...centroidToVertexDistances)
        const centroidToVertexDistancesPercentage = centroidToVertexDistances.map(
          (distance) => distance / maxDistance,
        )

        const centroidToSquareDistances = angles.map((angle) =>
          calculateDistanceToPointOnSquare(angle + rotationAngle),
        )

        const vertexToSquare = Math.max(
          ...centroidToVertexDistancesPercentage.map(
            (d1, index) => d1 / centroidToSquareDistances[index],
          ),
        )
        const distances = centroidToVertexDistancesPercentage.map(
          (d1) => d1 * vertexToSquare,
        )

        const coords = distances.map((d1, index) =>
          getCoords(d1, angles[index] + rotationAngle),
        )

        return coords
      }),
    [faces, vertices, centroids, rotationAngle],
  )
}
