import {MeshBuilder, Mesh, Vector3} from '@babylonjs/core'
import {TextBlock} from '@babylonjs/gui'
import {VIEWCONSTANT} from './constant'
import {NodeShape} from '../model/index'

class Point {
    static PREP = {
        PREFIX: {
            MESH: VIEWCONSTANT.PREFIX.MESH.NODE.PREP,
            TEXT: VIEWCONSTANT.PREFIX.TEXT
        },
        LAYER: {
            MESH: VIEWCONSTANT.LAYER.MESH.NODE.PREP,
            TEXT: VIEWCONSTANT.LAYER.TEXTBLOCK.LABEL.NODE.PREP
        }
    }
    static RSLT = {
        PREFIX: {
            MESH: VIEWCONSTANT.PREFIX.MESH.NODE.RSLT,
            TEXT: VIEWCONSTANT.PREFIX.TEXT
        },
        LAYER: {
            MESH: VIEWCONSTANT.LAYER.MESH.NODE.RSLT,
            TEXT: VIEWCONSTANT.LAYER.TEXTBLOCK.LABEL.NODE.RSLT
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
        const config = scene.metadata.useConfig()
        const label = new TextBlock(
            TYPE.PREFIX.TEXT + TYPE.PREFIX.MESH + node.no
        )
        label.text = node.no
        this.updateLabelStyle.call(label, {
            fontFamily: config.textBlock.fontFamily,
            fontSizeInPixels: config.textBlock.sizePx,
            color: config.textBlock.label.node.color,
            linkOffsetYInPixels: -config.textBlock.sizePx * 0.6
        })
        scene.ui.label.node[TYPE === Point.PREP ? 'prep' : 'rslt'].addControl(
            label
        )
        label.linkWithMesh(this.mesh)
        this.textBlock = {
            label,
            target: {
                nodeShape: []
            }
        }
    }
    createNodeShape(nodeShape) {
        const textBlocks = this.textBlock.target.nodeShape
        let textBlock
        const [key, value] = Object.entries(NodeShape.EQUALITY).find(
            ([_, v]) => v === nodeShape.equality
        )
        textBlock = textBlocks.find(item =>
            item?.metadata.map(item => item.equality).includes(value)
        )
        if (textBlock) {
            textBlock.metadata.push(nodeShape)
        } else {
            textBlock = new TextBlock(
                Point.PREP.PREFIX.TEXT + Point.PREP.PREFIX.MESH + this.no
            )
            textBlock.metadata = [nodeShape]
            textBlocks.push(textBlock)
        }
        textBlock.text = textBlock.metadata
            .sort((a, b) => a.type.is - b.type.is)
            .map(item => item.type.alias)
            .join('-')
        const scene = this.mesh.getScene()
        scene.ui.target.nodeShape[key.toLowerCase()].addControl(
            textBlock
        )
        textBlock.linkWithMesh(this.mesh)
        const config = scene.metadata.useConfig()
        this.updateLabelStyle.call(textBlock, {
            fontFamily: config.textBlock.fontFamily,
            fontSizeInPixels: config.textBlock.sizePx,
            color: config.textBlock.target.nodeShape.color,
            linkOffsetYInPixels: config.textBlock.sizePx * 0.6
        })
    }
    removeNodeShape(nodeShape) {
        const textBlocks = this.textBlock.target.nodeShape
        const index = textBlocks.findIndex(item =>
            item.metadata.includes(nodeShape)
        )
        if (index != -1) {
            const textBlock = textBlocks[index]
            const shapes = textBlock.metadata
            const j = shapes.findIndex(item => item === nodeShape)
            shapes.splice(j, 1)
            if (shapes) {
                textBlock.text = shapes.map(item => item.type.alias).join('-')
            } else {
                textBlocks.splice(index, 1)
                textBlock.dispose()
            }
        }
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
        this.mesh.metadata.no = n
        this.mesh.name = this.prefix + n
    }
    get text() {
        return this.textBlock.label.text
    }
    set text(t) {
        this.textBlock.label.text = t
    }
    updatePosition() {
        this.mesh.position = this.mesh.metadata.positionInScene
        return this
    }
    updateLabel() {
        //不更新name
        this.textBlock.label.text = String(this.mesh.metadata.no)
        return this
    }
    updateMeshColor(material) {
        if (material) {
            this.mesh.material = material
        } else {
            const model = this.mesh.getScene().metadata.useModel()
            const materials = this.mesh.getScene().metadata.materials
            const key1 = this.type === Point.PREP ? 'prep' : 'rslt'
            const key2 = model.categorized.node.free.find(
                node => node === this.mesh.metadata
            )
                ? 'free'
                : 'lock'
            this.mesh.material = materials.point[key1][key2]
        }
        return this
    }
    updateLabelStyle(style) {
        for (const [key, value] of Object.entries(style)) {
            this[key] = value
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
        this.textBlock.label.isVisible = true
    }
    hideText() {
        this.textBlock.label.isVisible = false
    }
    show() {
        this.mesh.isVisible = true
        this.textBlock.label.isVisible = true
    }
    hide() {
        this.mesh.isVisible = false
        this.textBlock.label.isVisible = false
    }
    remove() {
        this.mesh.dispose()
        this.textBlock.label.dispose()
    }
}

export {Point}
