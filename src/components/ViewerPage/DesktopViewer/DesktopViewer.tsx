import React, { memo, useContext } from "react"

import { useStyle } from "styles"
import { flexRow } from "styles/common"
import Sidebar from "./Sidebar"
import Overlay from "./Overlay"
import { SolidScene } from "../common"
import { DimensionsContext } from "../context"

interface Props {
  panel: string
  solid: string
}

const sidebarW = "24rem"

function Scene({ solid, full }: Pick<Props, "solid"> & { full: boolean }) {
  const { dimension } = useContext(DimensionsContext)
  const css = useStyle(
    {
      position: "relative",
      // width: full ? "100%" : `calc(100% - ${sidebarW})`,
      // height: "100%",
      alignSelf: "flex-start",
      width: dimension ? dimension[0] / 2 : "auto",
      height: dimension ? dimension[1] / 2 : "auto",
      margin: "50px",
      // backgroundColor: "black",
    },
    [full],
  )
  return (
    <div {...css()}>
      <SolidScene label={solid} />
      <Overlay solid={solid} />
    </div>
  )
}

function StyledSidebar({
  solid,
  panel,
  compact,
}: Props & { compact: boolean }) {
  const css = useStyle(
    compact
      ? {
          position: "absolute",
          top: 0,
          right: 0,
        }
      : {
          position: "relative",
          height: "100%",
          minWidth: sidebarW,
          maxWidth: sidebarW,
        },
    [compact],
  )
  return (
    <div {...css()}>
      <Sidebar panel={panel} solid={solid} compact={compact} />
    </div>
  )
}

export default memo(function DesktopViewer({ solid, panel }: Props) {
  const full = panel === "full"

  const css = useStyle({
    ...flexRow(),
    position: "fixed",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
  })
  return (
    <div {...css()}>
      <Scene solid={solid} full={full} />
      <StyledSidebar solid={solid} panel={panel} compact={full} />
    </div>
  )
})
