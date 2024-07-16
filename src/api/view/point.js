import {MeshBuilder, Mesh, Vector3} from '@babylonjs/core'
import {TextBlock} from '@babylonjs/gui'
import {useViewConfigStore} from './config'
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
        const label = new TextBlock(
            TYPE.PREFIX.TEXT + TYPE.PREFIX.MESH + node.no
        )
        label.text = node.no
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
        this.updateLabelStyle(this.textBlock.label)
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
                Point.PREP.PREFIX.TEXT + Point.PREP.PREFIX.MESH + this.mesh.metadata.no
            )
            textBlock.metadata = [nodeShape]
            textBlocks.push(textBlock)
        }
        textBlock.text = textBlock.metadata
            .sort((a, b) => a.type.is - b.type.is)
            .map(item => item.type.alias)
            .join('-')
        const scene = this.mesh.getScene()
        scene.ui.target.nodeShape[key.toLowerCase()].addControl(textBlock)
        textBlock.linkWithMesh(this.mesh)
        this.updateLabelStyle(textBlocks)
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
    get position() {
        return this.mesh.metadata.position
    }
    set position(p) {
        this.mesh.metadata.position = p
        this.mesh.position = this.mesh.metadata.positionInScene
    }
    updateMeshColor(material) {
        if (material) {
            this.mesh.material = material
        } else {
            const model = this.mesh.getScene().metadata.useModel()
            const materials = this.mesh.getScene().metadata.materials
            const key1 = model.categorized.node.free.find(
                node => node === this.mesh.metadata
            )
                ? 'free'
                : 'lock'
            this.mesh.material = materials.point[key1]
        }
        return this
    }
    updateLabelText(text = void 0) {
        if (text) {
            this.textBlock.label.text = text
        }
        else{
            this.textBlock.label.text = String(this.mesh.metadata.no)
        }
        return this
    }
    updateLabelStyle(textBlock = void 0) {
        const config = useViewConfigStore()
        let style
        if (!textBlock || textBlock === this.textBlock.label) {
            style = {
                fontFamily: config.textBlock.node.label.family,
                fontSizeInPixels: config.textBlock.node.label.size,
                color: config.textBlock.node.label.color,
                linkOffsetYInPixels: -config.textBlock.node.label.size * 0.6
            }
            for (const [key, value] of Object.entries(style)) {
                this.textBlock.label[key] = value
            }
        }
        if (!textBlock || textBlock === this.textBlock.target.nodeShape) {
            style = {
                fontFamily: config.textBlock.node.target.nodeShape.family,
                fontSizeInPixels: config.textBlock.node.target.nodeShape.size,
                color: config.textBlock.node.target.nodeShape.color,
                linkOffsetYInPixels:
                    -config.textBlock.node.target.nodeShape.size * 0.6
            }
            this.textBlock.target.nodeShape.forEach(textBlock => {
                for (const [key, value] of Object.entries(style)) {
                    textBlock[key] = value
                }
            })
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
