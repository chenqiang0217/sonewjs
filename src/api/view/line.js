import {
    MeshBuilder,
    VertexBuffer,
} from '@babylonjs/core'
import { TextBlock } from '@babylonjs/gui'
import { VIEWCONSTANT } from './constant'
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
        const config = scene.metadata.useConfig()
        const label = new TextBlock(
            TYPE.PREFIX.TEXT + TYPE.PREFIX.MESH + elem.no
        )
        label.text = elem.no
        this.updateLabelStyle.call(label, {
            fontFamily: config.textBlock.fontFamily,
            fontSizeInPixels: config.textBlock.sizePx,
            color: config.textBlock.label.elem.color,
        })
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
                Line.PREP.PREFIX.TEXT + Line.PREP.PREFIX.MESH + this.no
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
        const config = scene.metadata.useConfig()
        this.updateLabelStyle.call(textBlock, {
            fontFamily: config.textBlock.fontFamily,
            fontSizeInPixels: config.textBlock.sizePx,
            color: config.textBlock.target[which].color
        })
        this.alignText()
    }
    removeTarget(target) {
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
    updateLabel(){
        this.textBlock.label.text = this.mesh.metadata.no
        return this
    }
    get no() {
        return this.mesh.metadata.no
    }
    set no(n) {
        this.mesh.name = this.prefix + n
    }
    get text() {
        return this.textBlock.label.text
    }
    set text(t) {
        this.textBlock.label.text = t
    }
    updateMeshName() {
        this.mesh.name = this.prefix + this.mesh.metadata.no
        return this
    }
    updateLabelText(text = this.mesh.metadata.no) {
        this.textBlock.label.text = text
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

export { Line }
