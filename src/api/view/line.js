import {
    MeshBuilder,
    CreateGreasedLine,
    VertexBuffer
} from '@babylonjs/core'
import { TextBlock } from '@babylonjs/gui'
import { VIEWCONSTANT } from './index'
import { alignTextWithLine } from './control'
import { ElemShape, ElemForce } from '../model/index'
class Line {
    static PREP = {
        PREFIX: {
            MESH: VIEWCONSTANT.PREFIX.MESH.ELEM.PREP,
            TEXT: VIEWCONSTANT.PREFIX.TEXT
        },
        LAYER: {
            MESH: VIEWCONSTANT.LAYER.MESH.ELEM.PREP,
            TEXT: VIEWCONSTANT.LAYER.TEXTBLOCK.LABEL.ELEM.PREP
        }
    }
    static RSLT = {
        PREFIX: {
            MESH: VIEWCONSTANT.PREFIX.MESH.ELEM.RSLT,
            TEXT: VIEWCONSTANT.PREFIX.TEXT
        },
        LAYER: {
            MESH: VIEWCONSTANT.LAYER.MESH.ELEM.RSLT,
            TEXT: VIEWCONSTANT.LAYER.TEXTBLOCK.LABEL.ELEM.RSLT
        }
    }
    constructor(elem, scene, TYPE = Line.PREP) {
        this.type = TYPE
        this.mesh = _createMesh(elem, scene, TYPE)
        this.updateMeshColor()

        const label = new TextBlock(
            TYPE.PREFIX.TEXT + TYPE.PREFIX.MESH + elem.no
        )
        scene.ui.label.elem[TYPE === Line.PREP ? 'prep' : 'rslt'].addControl(
            label
        )
        label.linkWithMesh(this.mesh)
        this.textBlock = {
            label,
            target: {
                elemShape: [],
                elemForce: []
            }
        }
        this.updateLabelText()
        this.updateLabelStyle(this.textBlock.label)
        this.alignText = alignTextWithLine
        this.alignText()
    }
    createTarget(target) {
        let Target, which
        if (target instanceof ElemShape) {
            Target = ElemShape
            which = 'elemShape'
        } else if (target instanceof ElemForce) {
            Target = ElemForce
            which = 'elemForce'
        } else {
            return
        }
        const textBlocks = this.textBlock.target[which]
        let textBlock
        const [key, value] = Object.entries(Target.EQUALITY).find(
            ([_, v]) => v === target.equality
        )
        textBlock = textBlocks.find(item =>
            item?.metadata.map(item => item.equality).includes(value)
        )
        if (textBlock) {
            textBlock.metadata.push(target)
        } else {
            textBlock = new TextBlock(
                Line.PREP.PREFIX.TEXT +
                    Line.PREP.PREFIX.MESH +
                    this.mesh.metadata.no
            )
            textBlock.metadata = [target]
            textBlocks.push(textBlock)
        }
        textBlock.text = textBlock.metadata
            .sort((a, b) => a.type.is - b.type.is)
            .map(item => item.type.alias)
            .join('-')
        const scene = this.mesh.getScene()
        scene.ui.target[which][key.toLowerCase()].addControl(textBlock)
        textBlock.linkWithMesh(this.mesh)
        this.updateLabelStyle(textBlocks)
        this.alignText()
    }
    removeTarget(target) {
        let which
        if (target instanceof ElemShape) {
            which = 'elemShape'
        } else if (target instanceof ElemForce) {
            which = 'elemForce'
        } else {
            return
        }
        const textBlocks = this.textBlock.target[which]
        const index = textBlocks.findIndex(item =>
            item.metadata.includes(target)
        )
        if (index != -1) {
            const textBlock = textBlocks[index]
            const targets = textBlock.metadata
            const j = targets.findIndex(item => item === target)
            targets.splice(j, 1)
            if (targets) {
                textBlock.text = targets.map(item => item.type.alias).join('-')
            } else {
                textBlocks.splice(index, 1)
                textBlock.dispose()
            }
        }
    }
    updatePosition() {
        // const points = [
        //     ...this.mesh.metadata.iNode.positionInScene.asArray(),
        //     ...this.mesh.metadata.jNode.positionInScene.asArray()
        // ]
        // this.mesh.setPoints([points])
        _updateMeshVertices(this.mesh)
        this.alignText()
        return this
    }
    updateMeshColor(color) {
        if (color === void 0) {
            const config = this.mesh.getScene().metadata.useConfig()
            const binding = config.mesh.elem.color.binding
            color = this.mesh.metadata[binding].color
        }
        _updateMeshColor(this.mesh, color)
        return this
    }
    updateLabelText(text) {
        if (text === void 0) {
            const config = this.mesh.getScene().metadata.useConfig()
            const binding = config.textBlock.elem.label.binding
            text = this.mesh.metadata[binding].no || this.mesh.metadata[binding]
        }
        this.textBlock.label.text = text
        return this
    }
    updateLabelStyle(textBlock) {
        const config = this.mesh.getScene().metadata.useConfig()
        let style
        if (!textBlock || textBlock === this.textBlock.label) {
            style = {
                fontFamily: config.textBlock.elem.label.family,
                fontSizeInPixels:
                    config.textBlock.elem.label.size * window.devicePixelRatio,
                color: config.textBlock.elem.label.color
            }
            for (const [key, value] of Object.entries(style)) {
                this.textBlock.label[key] = value
            }
        }
        if (!textBlock || textBlock === this.textBlock.target.elemShape) {
            style = {
                fontFamily: config.textBlock.elem.target.elemShape.family,
                fontSizeInPixels:
                    config.textBlock.elem.target.elemShape.size *
                    window.devicePixelRatio,
                color: config.textBlock.elem.target.elemShape.color
            }
            this.textBlock.target.elemShape.forEach(textBlock => {
                for (const [key, value] of Object.entries(style)) {
                    textBlock[key] = value
                }
            })
        }
        if (!textBlock || textBlock === this.textBlock.target.elemForce) {
            style = {
                fontFamily: config.textBlock.elem.target.elemForce.family,
                fontSizeInPixels:
                    config.textBlock.elem.target.elemForce.size *
                    window.devicePixelRatio,
                color: config.textBlock.elem.target.elemForce.color
            }
            this.textBlock.target.elemForce.forEach(textBlock => {
                for (const [key, value] of Object.entries(style)) {
                    textBlock[key] = value
                }
            })
        }
        return this
    }
    update() {
        this.updatePosition()
        this.updateMeshColor()
        this.updateLabelText()
        this.updateLabelStyle()
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
        ;[
            this.mesh,
            this.textBlock.label,
            ...this.textBlock.target.elemShape,
            ...this.textBlock.target.elemForce
        ].forEach(item => {
            item.isVisible = true
        })
    }
    hide() {
        ;[
            this.mesh,
            this.textBlock.label,
            ...this.textBlock.target.elemShape,
            ...this.textBlock.target.elemForce
        ].forEach(item => {
            item.isVisible = false
        })
    }
    dispose() {
        this.mesh.dispose()
        this.textBlock.label.dispose()
    }
}

const _createMesh = (function () {
    if (window.devicePixelRatio == 1) {
        return (elem, scene, TYPE) => {
            const points = [
                elem.iNode.positionInScene,
                elem.jNode.positionInScene
            ]
            const mesh = MeshBuilder.CreateLines(
                TYPE.PREFIX.MESH + elem.no,
                { points, updatable: true },
                scene,
                true
            )
            mesh.layerMask = TYPE.LAYER.MESH
            mesh.isVisible = true
            mesh.metadata = elem
            return mesh
        }
    } else {
        return (elem, scene, TYPE) => {
            const points = [
                ...elem.iNode.positionInScene.asArray(),
                ...elem.jNode.positionInScene.asArray()
            ]
            const mesh = CreateGreasedLine(
                TYPE.PREFIX.MESH + elem.no,
                {
                    points,
                    updatable: true
                },
                {
                    width: scene.activeCamera.meshWidth.line
                },
                scene
            )
            // const pointsCount = GetPointsCount(mesh.points)
            // mesh.widths = CompleteGreasedLineWidthTable(
            //     pointsCount * 2,
            //     mesh.widths,
            //     GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_START
            // )
            mesh.widths = new Array(8).fill(1)
            mesh.layerMask = TYPE.LAYER.MESH
            mesh.isVisible = true
            mesh.metadata = elem
            return mesh
        }
    }
})()

const _updateMeshVertices = (function () {
    if (window.devicePixelRatio == 1) {
        return mesh => {
            const positions = [
                ...mesh.metadata.iNode.positionInScene.asArray(),
                ...mesh.metadata.jNode.positionInScene.asArray()
            ]
            mesh.updateVerticesData(
                VertexBuffer.PositionKind,
                new Float32Array(positions)
            )
            mesh.refreshBoundingInfo()
        }
    } else {
        return mesh => {
            const points = [
                ...mesh.metadata.iNode.positionInScene.asArray(),
                ...mesh.metadata.jNode.positionInScene.asArray()
            ]
            mesh.setPoints([points])
        }
    }
})()

const _updateMeshColor = (function () {
    if (window.devicePixelRatio == 1) {
        return (mesh, color) => (mesh.color = color)
    } else {
        return (mesh, color) => (mesh.greasedLineMaterial.color = color)
    }
})()

export { Line }
