import { pick } from "lodash-es"
import React, { useCallback, useRef } from "react"
import X3dScene from "./X3dScene"
import X3dPolyhedron from "./X3dPolyhedron"

import useSolidContext from "./useSolidContext"
import useHitOptions from "./useHitOptions"
import useSaveFrame from "./useSaveFrame"
import useRotation from "./useRotation"
import Config from "components/ConfigCtx"

export default function SolidScene({ label }: { label: string }) {
  const { colors, solidData } = useSolidContext()
  const config = Config.useState()
  const { setHitOption, unsetHitOption, applyWithHitOption } = useHitOptions()
  const x3dRef = useRef<any>(null)

  const { saveFrame } = useSaveFrame({
    isActive: true,
    dirname: "/Volumes/Shared/dices",
    filename: label,
    x3dRef,
  })

  const handleTick = useCallback(
    ({ tick, maxTicks }) => {
      saveFrame(tick, maxTicks.toString().length)
    },
    [saveFrame],
  )

  const { vertices } = useRotation({
    fps: 60,
    secondsPerRotation: 0.5,
    fullRotation: 2 * Math.PI,
    onTick: handleTick,
    x3dRef,
    label,
    viewVector: [0, 0, 3.5],
  })

  return (
    <X3dScene label={label} x3d={x3dRef}>
      <X3dPolyhedron
        value={solidData}
        colors={colors}
        config={pick(config, [
          "showFaces",
          "showEdges",
          "showInnerFaces",
          "opacity",
          "textureAngle",
        ])}
        onHover={setHitOption}
        onMouseOut={unsetHitOption}
        onClick={applyWithHitOption}
        vertices={vertices}
      />
    </X3dScene>
  )
}
