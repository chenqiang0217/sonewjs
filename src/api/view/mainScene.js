import {Engine, Scene, Vector3} from '@babylonjs/core'
import {AdvancedDynamicTexture} from '@babylonjs/gui'
import {OrthoCamera} from './camera'
import {AxisScene} from './axisScene'
import {VIEWCONSTANT} from './constant'

class MainScene extends Scene {
    constructor(canvas) {
        const engine = new Engine(canvas)
        engine.disablePerformanceMonitorInBackground = true
        engine.preserveDrawingBuffer = false
        engine.premultipliedAlpha = false
        engine.enableOfflineSupport = false
        engine.doNotHandleContextLost = true
        super(engine)
        this.autoClear = false
        this.useRightHandedSystem = true
        this.autoClearDepthAndStencil = false
        this.blockMaterialDirtyMechanism = true
        this.gravity = new Vector3(0, 0, 0)
        this.collisionsEnabled = false
        new OrthoCamera(this)
        this.activeCamera.attachControl(false)
        this.ui = {
            label: {
                node: {
                    prep: AdvancedDynamicTexture.CreateFullscreenUI(
                        `textNodePrep`,
                        true,
                        this
                    ),
                    rslt: AdvancedDynamicTexture.CreateFullscreenUI(
                        `textNodeRslt`,
                        true,
                        this
                    )
                },
                elem: {
                    prep: AdvancedDynamicTexture.CreateFullscreenUI(
                        `textElemPrep`,
                        true,
                        this
                    ),
                    rslt: AdvancedDynamicTexture.CreateFullscreenUI(
                        `textElemRslt`,
                        true,
                        this
                    )
                }
            },
            target: {
                nodeShape: {
                    eq: AdvancedDynamicTexture.CreateFullscreenUI(
                        `symbolTargetNodeShapeEq`,
                        true,
                        this
                    ),
                    gt: AdvancedDynamicTexture.CreateFullscreenUI(
                        `symbolTargetNodeShapeGt`,
                        true,
                        this
                    ),
                    lt: AdvancedDynamicTexture.CreateFullscreenUI(
                        `symbolTargetNodeShapeLt`,
                        true,
                        this
                    )
                },
                elemShape: {
                    eq: AdvancedDynamicTexture.CreateFullscreenUI(
                        `symbolTargetElemShapeEq`,
                        true,
                        this
                    ),
                    gt: AdvancedDynamicTexture.CreateFullscreenUI(
                        `symbolTargetElemShapeGt`,
                        true,
                        this
                    ),
                    lt: AdvancedDynamicTexture.CreateFullscreenUI(
                        `symbolTargetElemShapeLt`,
                        true,
                        this
                    )
                },
                elemForce: {
                    eq: AdvancedDynamicTexture.CreateFullscreenUI(
                        `symbolTargetElemForceEq`,
                        true,
                        this
                    ),
                    gt: AdvancedDynamicTexture.CreateFullscreenUI(
                        `symbolTargetElemForceGt`,
                        true,
                        this
                    ),
                    lt: AdvancedDynamicTexture.CreateFullscreenUI(
                        `symbolTargetElemForceLt`,
                        true,
                        this
                    )
                }
            }
        }
        this.ui.label.node.prep.layer.layerMask = VIEWCONSTANT.LAYER.TEXTBLOCK.LABEL.NODE.PREP
        this.ui.label.node.rslt.layer.layerMask = VIEWCONSTANT.LAYER.TEXTBLOCK.LABEL.NODE.RSLT
        this.ui.label.elem.prep.layer.layerMask = VIEWCONSTANT.LAYER.TEXTBLOCK.LABEL.ELEM.PREP
        this.ui.label.elem.rslt.layer.layerMask = VIEWCONSTANT.LAYER.TEXTBLOCK.LABEL.ELEM.RSLT

        this.ui.target.nodeShape.eq.layer.layerMask =
            VIEWCONSTANT.LAYER.TEXTBLOCK.TARGET.NODESHAPE.EQ
        this.ui.target.nodeShape.gt.layer.layerMask =
            VIEWCONSTANT.LAYER.TEXTBLOCK.TARGET.NODESHAPE.GT
        this.ui.target.nodeShape.lt.layer.layerMask =
            VIEWCONSTANT.LAYER.TEXTBLOCK.TARGET.NODESHAPE.LT

        this.ui.target.elemShape.eq.layer.layerMask =
            VIEWCONSTANT.LAYER.TEXTBLOCK.TARGET.ELEMSHAPE.EQ
        this.ui.target.elemShape.gt.layer.layerMask =
            VIEWCONSTANT.LAYER.TEXTBLOCK.TARGET.ELEMSHAPE.GT
        this.ui.target.elemShape.lt.layer.layerMask =
            VIEWCONSTANT.LAYER.TEXTBLOCK.TARGET.ELEMSHAPE.LT

        this.ui.target.elemForce.eq.layer.layerMask =
            VIEWCONSTANT.LAYER.TEXTBLOCK.TARGET.ELEMFORCE.EQ
        this.ui.target.elemForce.gt.layer.layerMask =
            VIEWCONSTANT.LAYER.TEXTBLOCK.TARGET.ELEMFORCE.GT
        this.ui.target.elemForce.lt.layer.layerMask =
            VIEWCONSTANT.LAYER.TEXTBLOCK.TARGET.ELEMFORCE.LT

        const resizeObserver = new ResizeObserver(() => {
            this.activeCamera.setView()
        })
        resizeObserver.observe(canvas)
        canvas.addEventListener('wheel', evt => {
            this.activeCamera.zoom(evt)
        })
        const axisScene = new AxisScene(engine)
        engine.runRenderLoop(() => {
            this.render()
        })
        this.registerAfterRender(() => {
            axisScene.render()
            axisScene.activeCamera.alpha = this.activeCamera.alpha
            axisScene.activeCamera.beta = this.activeCamera.beta
        })
    }
}

export {MainScene}
