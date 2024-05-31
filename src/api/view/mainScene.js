import { Engine, Scene, Vector3 } from '@babylonjs/core'
import { AdvancedDynamicTexture } from '@babylonjs/gui'
import { OrthoCamera } from './camera'
import { AxisScene } from './axisScene'
import { VIEWCONSTANT } from './constant'

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
        }
        this.ui.node.prep.layer.layerMask = VIEWCONSTANT.LAYER.TEXT.NODE.PREP
        this.ui.node.rslt.layer.layerMask = VIEWCONSTANT.LAYER.TEXT.NODE.RSLT
        this.ui.elem.prep.layer.layerMask = VIEWCONSTANT.LAYER.TEXT.ELEM.PREP
        this.ui.elem.rslt.layer.layerMask = VIEWCONSTANT.LAYER.TEXT.ELEM.RSLT

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

export { MainScene }
