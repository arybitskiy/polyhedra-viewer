import { RefAttributes, HTMLAttributes } from "react"
// https://github.com/Microsoft/TypeScript/issues/15449

type X3dNode = { is: string; class?: string } & RefAttributes<any> &
  HTMLAttributes<any>
declare global {
  namespace JSX {
    interface IntrinsicElements {
      x3d: X3dNode
      scene: X3dNode
      viewpoint: X3dNode & {
        position?: string
        centerofrotation?: string
        orientation?: string
        bind?: string
      }
      coordinate: X3dNode & { point: string }
      shape: X3dNode
      indexedlineset: X3dNode & { coordindex: string }
      indexedfaceset: X3dNode & {
        coordindex: string
        solid: string
        colorpervertex: string
        normalpervertex?: string
        texcoordindex?: string
        creaseangle?: string
      }
      material: X3dNode & { transparency?: number; diffuseColor?: string }
      appearance: X3dNode
      color: X3dNode & { color: string }
      transform: X3dNode & { rotation?: string; translation?: string }
      imagetexture: X3dNode & { url: string }
      texturecoordinate: X3dNode & { point: string }
      texturetransform: X3dNode & {
        center?: string
        rotation?: string
        scale?: string
        translation?: string
      }
      texture: X3dNode & { hideChildren?: string }
      sphere: X3dNode & { radius?: string }
      texturecoordinategenerator: X3dNode & {
        mode?: string
        parameter?: string
      }
      textureproperties: X3dNode & {
        anisotropicDegree?: string
        borderColor?: string
        borderWidth?: string
        boundaryModeS?: string
        boundaryModeT?: string
        boundaryModeR?: string
        magnificationFilter?: string
        minificationFilter?: string
        textureCompression?: string
        texturePriority?: string
        generateMipMaps?: string
      }
    }
  }
}
