import { MeshBuilder, Mesh, Vector3 } from '@babylonjs/core'
import { TextBlock } from '@babylonjs/gui'
import { VIEWCONSTANT } from './constant'

class Point {
    static PREP = {
        PREFIX: {
            MESH: VIEWCONSTANT.PREFIX.MESH.NODE.PREP,
            TEXT: VIEWCONSTANT.PREFIX.TEXT
        },
        LAYER: {
            MESH: VIEWCONSTANT.LAYER.MESH.NODE.PREP,
            TEXT: VIEWCONSTANT.LAYER.TEXT.NODE.PREP
        }
    }
    static RSLT = {
        PREFIX: {
            MESH: VIEWCONSTANT.PREFIX.MESH.NODE.RSLT,
            TEXT: VIEWCONSTANT.PREFIX.TEXT
        },
        LAYER: {
            MESH: VIEWCONSTANT.LAYER.MESH.NODE.RSLT,
            TEXT: VIEWCONSTANT.LAYER.TEXT.NODE.RSLT
        }
    }
    constructor(node, scene, TYPE = Point.PREP) {
        this.type = TYPE
        const nodeSize = scene.activeCamera.nodeSize
        const option = {
            size: 1.0,
            sideOrientation: Mesh.DOUBLESIDE
        }
        this.mesh = MeshBuilder.CreatePlane(
            TYPE.PREFIX.MESH + node.no,
            option,
            scene
        )
        this.mesh.scaling = Vector3.One().scale(nodeSize)
        this.mesh.position = node.positionInScene
        this.mesh.layerMask = TYPE.LAYER.MESH
        this.mesh.billboardMode = 7
        this.mesh.isVisible = true
        this.mesh.metadata = node
        this.updateMeshColor()
        this.linkedLines = new Set()
        const config = scene.metadata.useConfig()
        this.label = new TextBlock(
            TYPE.PREFIX.TEXT + TYPE.PREFIX.MESH + node.no
        )
        this.label.text = node.no
        this.updateLabelStyle({
            fontSizeInPixels: config.text.node.sizePx,
            color: config.text.node.color,
            linkOffsetYInPixels: -config.text.node.sizePx * 0.6
        })
        scene.ui.node[TYPE === Point.PREP ? 'prep' : 'rslt'].addControl(
            this.label
        )
        this.label.linkWithMesh(this.mesh)
    }
    get prefix() {
        let regex = /^[a-z]+/
        return this.mesh.name.match(regex).shift()
    }
    get position() {
        return this.mesh.metadata.position
    }
    set position(p) {
        this.mesh.metadata.position = p
        this.mesh.position = this.mesh.metadata.positionInScene
    }
    get positionInScene() {
        return this.mesh.metadata.positionInScene
    }
    get no() {
        return this.mesh.metadata.no
    }
    set no(n) {
        // this.mesh.metadata.no = n
        this.mesh.name = this.prefix + n
    }
    get text() {
        return this.label.text
    }
    set text(t) {
        this.label.text = t
    }
    updateMeshColor(material) {
        if (material) {
            this.mesh.material = material
        } else {
            const model = this.mesh.getScene().metadata.useModel()
            const materials = this.mesh.getScene().metadata.materials
            const key1 = this.type === Point.PREP ? 'prep' : 'rslt'
            const key2 = model.categorized.node.free.find(node => node === this.mesh.metadata) ? 'free' : 'lock'
            this.mesh.material = materials.point[key1][key2]
        }
        return this
    }
    updateLabelStyle(style) {
        for (const [key, value] of Object.entries(style)) {
            this.label[key] = value
        }
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

export { Point }
