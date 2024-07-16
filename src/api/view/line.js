import {
    MeshBuilder,
    VertexBuffer,
} from '@babylonjs/core'
import { TextBlock } from '@babylonjs/gui'
import { VIEWCONSTANT } from './index'
import { alignTextWithLine } from './control'
import {ElemShape, ElemForce} from '../model/index'
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
        if(target instanceof ElemShape){
            Target = ElemShape
            which= 'elemShape'
        }
        else if(target instanceof ElemForce){
            Target = ElemForce
            which= 'elemForce'
        }
        else{
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
                Line.PREP.PREFIX.TEXT + Line.PREP.PREFIX.MESH + this.mesh.metadata.no
            )
            textBlock.metadata = [target]
            textBlocks.push(textBlock)
        }
        textBlock.text = textBlock.metadata
            .sort((a, b) => a.type.is - b.type.is)
            .map(item => item.type.alias)
            .join('-')
        const scene = this.mesh.getScene()
        scene.ui.target[which][key.toLowerCase()].addControl(
            textBlock
        )
        textBlock.linkWithMesh(this.mesh)
        this.updateLabelStyle(textBlocks)
        this.alignText()
    }
    removeTarget(target) {
        let which
        if(target instanceof ElemShape){
            which= 'elemShape'
        }
        else if(target instanceof ElemForce){
            which= 'elemForce'
        }
        else{
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
    // get prefix() {
    //     let regex = /^[a-z]+/
    //     return this.mesh.name.match(regex).shift()
    // }
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
    updateMeshColor(color) {
        if (color) {
            this.mesh.color = color
        } else {
            const config = this.mesh.getScene().metadata.useConfig()
            const binding = config.mesh.elem.color.binding
            this.mesh.color = this.mesh.metadata[binding].color
        }
        return this
    }
    updateLabelText(text) {
        if (text) {
            this.textBlock.label.text = text
        } else {
            const config = this.mesh.getScene().metadata.useConfig()
            const binding = config.textBlock.elem.label.binding
            this.textBlock.label.text = this.mesh.metadata[binding].no || this.mesh.metadata[binding]
        }
        return this
    }
    updateLabelStyle(textBlock) {
        const config = this.mesh.getScene().metadata.useConfig()
        let style
        if (!textBlock || textBlock === this.textBlock.label) {
            style = {
                fontFamily: config.textBlock.elem.label.family,
                fontSizeInPixels: config.textBlock.elem.label.size,
                color: config.textBlock.elem.label.color
            }
            for (const [key, value] of Object.entries(style)) {
                this.textBlock.label[key] = value
            }
        }
        if (!textBlock || textBlock === this.textBlock.target.elemShape) {
            style = {
                fontFamily: config.textBlock.elem.target.elemShape.family,
                fontSizeInPixels: config.textBlock.elem.target.elemShape.size,
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
                fontSizeInPixels: config.textBlock.elem.target.elemForce.size,
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

export { Line }
