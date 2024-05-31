import {
    MeshBuilder,
    VertexBuffer,
} from '@babylonjs/core'
import { TextBlock } from '@babylonjs/gui'
import { VIEWCONSTANT } from './constant'
import { alignTextWithLine } from './control'

class Line {
    static PREP = {
        PREFIX: {
            MESH: VIEWCONSTANT.PREFIX.MESH.ELEM.PREP,
            TEXT: VIEWCONSTANT.PREFIX.TEXT
        },
        LAYER: {
            MESH: VIEWCONSTANT.LAYER.MESH.ELEM.PREP,
            TEXT: VIEWCONSTANT.LAYER.TEXT.ELEM.PREP
        }
    }
    static RSLT = {
        PREFIX: {
            MESH: VIEWCONSTANT.PREFIX.MESH.ELEM.RSLT,
            TEXT: VIEWCONSTANT.PREFIX.TEXT
        },
        LAYER: {
            MESH: VIEWCONSTANT.LAYER.MESH.ELEM.RSLT,
            TEXT: VIEWCONSTANT.LAYER.TEXT.ELEM.RSLT
        }
    }
    constructor(elem, scene, TYPE = Line.PREP) {
        this.type = TYPE
        const points = [elem.iNode.positionInScene, elem.jNode.positionInScene]
        this.mesh = MeshBuilder.CreateLines(
            TYPE.PREFIX.MESH + elem.no,
            { points, updatable: true },
            scene,
            true
        )
        this.mesh.layerMask = TYPE.LAYER.MESH
        this.mesh.isVisible = true
        this.mesh.metadata = elem
        this.updateMeshColor()

        const config = scene.metadata.useConfig()
        this.label = new TextBlock(
            TYPE.PREFIX.TEXT + TYPE.PREFIX.MESH + elem.no
        )
        this.label.text = elem.no
        this.updateLabelStyle({
            fontSizeInPixels: config.text.elem.sizePx,
            color: config.text.elem.color
        })
        scene.ui.elem[TYPE === Line.PREP ? 'prep' : 'rslt'].addControl(
            this.label
        )
        this.label.linkWithMesh(this.mesh)

        this.alignText = alignTextWithLine
        this.alignText()
    }
    get prefix() {
        let regex = /^[a-z]+/
        return this.mesh.name.match(regex).shift()
    }
    updatePosition() {
        const positions = [
            ...this.mesh.metadata.iNode.positionInScene.asArray(),
            ...this.mesh.metadata.jNode.positionInScene.asArray()
        ]
        this.mesh.updateVerticesData(
            VertexBuffer.PositionKind,
            new Float32Array(positions)
        )
        this.mesh.refreshBoundingInfo()
        this.alignText()
        return this
    }
    get no() {
        return this.mesh.metadata.no
    }
    set no(n) {
        this.mesh.name = this.prefix + n
    }
    get text() {
        return this.label.text
    }
    set text(t) {
        this.label.text = t
    }
    updateMeshName() {
        this.mesh.name = this.prefix + this.mesh.metadata.no
        return this
    }
    updateLabelText(text = this.mesh.metadata.no) {
        this.label.text = text
        return this
    }
    updateMeshColor(color) {
        if (color) {
            this.mesh.color = color
        } else {
            const config = this.mesh.getScene().metadata.useConfig()
            const type = this.type === Line.PREP ? 'prep' : 'rslt'
            const binding = config.mesh.elem.color[type].binding
            const elem = this.mesh.metadata
            this.mesh.color = config.mesh.elem.color[type][binding].get(
                elem[binding]
            )
        }
        return this
    }
    updateLabelStyle(style) {
        for (const [key, value] of Object.entries(style)) {
            this.label[key] = value
        }
        return this
    }
    showMesh() {
        this.mesh.isVisible = true
    }
    hideMesh() {
        this.mesh.isVisible = false
    }
    showText() {
        this.label.isVisible = true
    }
    hideText() {
        this.label.isVisible = false
    }
    show() {
        this.mesh.isVisible = true
        this.label.isVisible = true
    }
    hide() {
        this.mesh.isVisible = false
        this.label.isVisible = false
    }
    remove() {
        // const scene = this.mesh.getScene()
        // scene.removeMesh(this.mesh)
        // scene.ui.removeControl(this.label)
        this.mesh.dispose()
        this.label.dispose()
    }
}

export { Line }
