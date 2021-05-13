import { useCallback, RefObject, useContext } from "react"
import { padStart } from "lodash-es"

import { DimensionsContext } from "../../context"

// Only in electron
const fs = window.require && window.require("fs")
const isAvailable = !!fs

interface UseSaveFrameConfig {
  isActive: boolean
  dirname: string
  filename: string
  x3dRef: RefObject<any>
}

export default function useSaveFrame({
  isActive,
  dirname,
  filename,
  x3dRef,
}: UseSaveFrameConfig) {
  const dirnameFixed = dirname.replace(/ /g, "_")
  const filenameFixed = filename.replace(/ /g, "_")
  const { dimension } = useContext(DimensionsContext)
  const dimensionName = dimension
    ? `${dimension[0]}x${dimension[1]}`
    : undefined
  const fullDirname = `${dirnameFixed}/${filenameFixed}/${dimensionName}`

  const isEnabled = isActive && isAvailable

  const saveFrame = useCallback(
    (tick: number, padAtStart: number) => {
      const { current } = x3dRef

      if (isEnabled && current && current.runtime) {
        if (tick === 0) {
          fs.rmSync(fullDirname, {
            recursive: true,
            force: true,
          })
          fs.mkdirSync(fullDirname, {
            recursive: true,
          })
        }

        const base64Image = current.runtime.getScreenshot() as string
        const buffer = new Buffer(
          base64Image.replace(/^data:image\/png;base64,/, ""),
          "base64",
        )
        fs.writeFileSync(
          `${fullDirname}/${filenameFixed}_${dimensionName}_${padStart(
            tick.toString(),
            padAtStart,
            "0",
          )}.png`,
          buffer,
        )
      }
    },
    [isEnabled, x3dRef, filenameFixed, dimensionName, fullDirname],
  )

  return { x3dRef, saveFrame }
}
