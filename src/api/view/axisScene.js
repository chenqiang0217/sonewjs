import {
    Scene, AxesViewer, Vector3, MeshBuilder, Mesh, Viewport
} from "@babylonjs/core"
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui"
import { OrthoCamera } from "./camera"

class AxisScene extends Scene {
    static AXIS_LABLE = [
        { AXIS: 'z', TEXT: 'x', COLOR: '#2F81DF' },
        { AXIS: 'x', TEXT: 'y', COLOR: '#EA3751' },
        { AXIS: 'y', TEXT: 'z', COLOR: '#85D10C' },
    ]
    constructor(engine) {
        super(engine)
        this.autoClear = false
        this.useRightHandedSystem = true
        this.autoClearDepthAndStencil = false
        this.blockMaterialDirtyMechanism = true
        this.gravity = new Vector3(0, 0, 0)
        this.collisionsEnabled = false

        this.canvas = engine.getRenderingCanvas()
        this.axisHelperSize = 1
        new OrthoCamera(this)
        this.updateViewport()
        this.activeCamera.radius = this.axisHelperSize * 5.0
        this.activeCamera.orthoLeft = - this.axisHelperSize * 1.5
        this.activeCamera.orthoRight = this.axisHelperSize * 1.5
        this.activeCamera.orthoTop = this.axisHelperSize * 1.5
        this.activeCamera.orthoBottom = - this.axisHelperSize * 1.5
        this.activeCamera.resizeObserver.disconnect()

        new AxesViewer(this, 0.60 * this.axisHelperSize, void 0, void 0, void 0, void 0, 4)
        this.ui = AdvancedDynamicTexture.CreateFullscreenUI("axisUi", true, this)
        for (let i = 0; i < 3; i++) {
            const axis = MeshBuilder.CreatePlane('viewaxes', { height: 1, width: 1, sideOrientation: Mesh.DOUBLESIDE }, this)
            axis.scaling = axis.scaling.scale(0.0 * this.axisHelperSize)
            axis.billboardMode = 7
            axis.position[AxisScene.AXIS_LABLE[i].AXIS] = 1.0 * this.axisHelperSize
            if (i == 2) {
                axis.position[AxisScene.AXIS_LABLE[i].AXIS] = 1.2 * this.axisHelperSize
            }
            const text = new TextBlock()
            text.text = AxisScene.AXIS_LABLE[i].TEXT
            this.updateTextSize()
            text.color = AxisScene.AXIS_LABLE[i].COLOR
            this.ui.addControl(text)
            text.linkWithMesh(axis)
            axis.doNotSyncBoundingInfo = true
            axis.doNotSerialize = true
            axis.convertToUnIndexedMesh()
            axis.freezeNormals()
        }
        const resizeObserver = new ResizeObserver(() => {
            this.updateViewport()
            this.updateTextSize()
        })
        resizeObserver.observe(this.canvas)
    }
    updateViewport(w = 100, h = 100, left = 5, bottom = -5) {
        this.activeCamera.viewport = new Viewport(left / this.canvas.width, 1 - (bottom + this.canvas.height) / this.canvas.height,
            w / this.canvas.width, h / this.canvas.height)
    }
    updateTextSize(h = 100) {
        this.ui.getControlsByType('TextBlock')
            .forEach(textBlock => {
                textBlock.fontSizeInPixels = 20 * canvas.height / h
                textBlock.scaleX = canvas.width / canvas.height * 1
            })
    }
}

export { AxisScene }