import {Vector3, Vector2, MeshBuilder, VertexBuffer} from '@babylonjs/core'
import {watch} from 'vue'
import {useView} from './index'
import {SetOperation} from '../utils'

class Control {
    constructor(scene) {
        const constant = scene.metadata.constant
        const status = scene.metadata.useStatus()
        this.LAYER = constant.LAYER
        this.camera = scene.activeCamera
        this.pickBox = MeshBuilder.CreateBox(
            'pickBox',
            {width: 1, height: 1, depth: 1},
            scene
        )
        this.pickBox.layerMask = this.LAYER.PICKBOX
        this.pickBox.visibility = 0.5
        this.hidePickBox()
        // 视图旋转、mesh框选
        watch(
            () => status.mode,
            mode => {
                if (mode === constant.ROTATING) {
                    this.camera.attachControl(false)
                    let layerMask
                    scene.onPointerDown = () => {
                        //旋转过程text全部隐藏
                        layerMask = this.camera.layerMask
                        this.hideTextBlock('label')
                        this.hideTextBlock('target')
                    }
                    scene.onPointerMove = null
                    scene.onPointerUp = evt => {
                        //旋转结束lines文字对齐lines
                        if (evt.button === 0) {
                            alignTextWithLines()
                        }
                        this.camera.layerMask = layerMask
                    }
                } else {
                    this.camera.detachControl()
                    scene.onPointerDown = onPickStart
                    scene.onPointerUp = onPickEnd
                    switch (mode) {
                        case constant.SELECTING.S:
                            status.mesh.selected.node.clear()
                            status.mesh.selected.elem.clear()
                            break
                        case constant.SELECTING.A:
                            break
                        case constant.SELECTING.U:
                            break
                        case constant.SELECTING.NONE:
                            status.mesh.selected.node.clear()
                            status.mesh.selected.elem.clear()
                            this.camera.attachControl(false)
                            scene.onPointerDown = null
                            scene.onPointerUp = null
                            status.mode = constant.ROTATING
                            break
                    }
                }
            },
            {immediate: true}
        )
        //是否显示节点
        watch(
            () => status.mesh.visible.node,
            visible => {
                this.showMesh(`node`, `all`, visible)
            },
            {immediate: true}
        )
        //是否显示节点text
        watch(
            () => status.textBlock.visible.label.node,
            visible => {
                this.showTextBlock(`label`, `node`, `all`, visible)
            },
            {immediate: true}
        )
        //是否显示单元text
        watch(
            () => status.textBlock.visible.label.elem,
            visible => {
                this.showTextBlock(`label`, `elem`, `all`, visible)
            },
            {immediate: true}
        )
        //是否显示nodeShape text
        watch(
            () => status.textBlock.visible.target.nodeShape.all,
            visible => {
                this.showTextBlock(`target`, `nodeShape`, `all`, visible)
                Array.from(['eq', 'gt', 'lt']).forEach(key => {
                    status.textBlock.visible.target.nodeShape[key] = visible
                })
            },
            {immediate: true}
        )
        //是否显示target text
        watch(
            () => status.textBlock.visible.target.all,
            visible => {
                this.showTextBlock(`target`, `all`, `all`, visible)
                Array.from(['nodeShape', 'elemShape', 'elemForce']).forEach(
                    key =>
                        (status.textBlock.visible.target[key]['all'] = visible)
                )
            },
            {immediate: true}
        )
        //是否显示nodeShape text
        watch(
            () => status.textBlock.visible.target.nodeShape.all,
            visible => {
                this.showTextBlock(`target`, `nodeShape`, `all`, visible)
                Array.from(['eq', 'gt', 'lt']).forEach(
                    key =>
                        (status.textBlock.visible.target.nodeShape[key] =
                            visible)
                )
            },
            {immediate: true}
        )
        //是否显示elemShape text
        watch(
            () => status.textBlock.visible.target.elemShape.all,
            visible => {
                this.showTextBlock(`target`, `elemShape`, `all`, visible)
                Array.from(['eq', 'gt', 'lt']).forEach(
                    key =>
                        (status.textBlock.visible.target.elemShape[key] =
                            visible)
                )
            },
            {immediate: true}
        )
        //是否显示elemForce text
        watch(
            () => status.textBlock.visible.target.elemForce.all,
            visible => {
                this.showTextBlock(`target`, `elemForce`, `all`, visible)
                Array.from(['eq', 'gt', 'lt']).forEach(
                    key =>
                        (status.textBlock.visible.target.elemForce[key] =
                            visible)
                )
            },
            {immediate: true}
        )
        //选中节点，单元显红
        watch(
            () => new Set(Array.from(status.mesh.selected.node)),
            (now, pre) => {
                onNodeSelected(now, pre)
            },
            {deep: true}
        )
        watch(
            () => new Set(Array.from(status.mesh.selected.elem)),
            (now, pre) => {
                onElemSelected(now, pre)
            },
            {deep: true}
        )
    }
    showMesh(entity = 'all', which = 'all', visible = true) {
        entity = entity.toUpperCase()
        which = which.toUpperCase()
        const layer = this.LAYER.MESH[entity][which]
        this.showLayer(layer, visible)
    }
    hideMesh(entity = 'all', which = 'all') {
        this.showMesh(entity, which, false)
    }
    showTextBlock(type, entity = 'all', which = 'all', visible = true) {
        type = type.toUpperCase()
        entity = entity.toUpperCase()
        which = which.toUpperCase()
        let layer = this.LAYER.TEXTBLOCK[type][entity][which]
        this.showLayer(layer, visible)
    }
    hideTextBlock(type, entity = 'all', which = 'all') {
        this.showTextBlock(type, entity, which, false)
    }
    showPickBox(visible = true) {
        this.showLayer(this.LAYER.PICKBOX, visible)
    }
    hidePickBox() {
        this.showPickBox(false)
    }
    showLayer(layer, visible) {
        if (visible) {
            this.camera.layerMask |= layer
        } else {
            this.camera.layerMask &= ~layer
        }
    }
}

function alignTextWithLines() {
    const view = useView()
    const lines = [...view.lines.prep, ...view.lines.rslt]
    lines.forEach(line => {
        alignTextWithLine.call(line)
    })
}
function alignTextWithLine() {
    const view = useView()
    let points = this.mesh.getVerticesData(VertexBuffer.PositionKind)
    let aPoint = Vector3.FromArray(points, 0)
    let bPoint = Vector3.FromArray(points, 3)
    let {x, y} = Vector3.TransformNormal(
        bPoint.subtract(aPoint),
        view.scene.activeCamera.getViewMatrix()
    )
    let v1 = new Vector2(x, y),v2
    if(v1.length() > Number.EPSILON){
        v1 = v1.scale(1 / v1.length())
        if (v1.x < 0) {
            v1 = v1.negate()
        }
        v2 = new Vector2(-v1.y, v1.x)
    }
    else{
        v2 = new Vector2(0, 1)
    }
    const textBlocks = [
        this.textBlock.label,
        ...this.textBlock.target.elemShape,
        ...this.textBlock.target.elemForce
    ]
    textBlocks.forEach((textBlock, index) => {
        const alpha = index ? -1.0 : 1.0
        textBlock.rotation = -Math.asin(v1.y)
        textBlock.linkOffsetXInPixels =
            alpha * textBlock.fontSizeInPixels * v2.x * 0.6
        textBlock.linkOffsetYInPixels =
            -alpha * textBlock.fontSizeInPixels * v2.y * 0.6
    })
}

function onPickStart() {
    //  view.scene.activeCamera.alpha:绕y轴的角度，从x轴起算
    //  view.scene.activeCamera.beta：绕x轴的角度，从y轴起算
    const view = useView()
    const status = view.scene.metadata.useStatus()
    view.control.showPickBox()
    const pickBox = view.control.pickBox
    pickBox.rotation.x = -Math.PI / 2 + view.scene.activeCamera.beta
    pickBox.rotation.y = Math.PI / 2 - view.scene.activeCamera.alpha
    status.pointer[0] = {x: view.scene.pointerX, y: view.scene.pointerY}
    const pickResult = view.scene.pick(view.scene.pointerX, view.scene.pointerY)
    pickBox.position = pickResult.ray.origin.add(
        pickResult.ray.direction.scale(view.scene.activeCamera.radius)
    )
    view.scene.onPointerMove = onPickProcessing
    view.scene.onPointerDown = null
}
function onPickProcessing() {
    const view = useView()
    const status = view.scene.metadata.useStatus()
    const pickBox = view.control.pickBox
    status.pointer[1] = {x: view.scene.pointerX, y: view.scene.pointerY}
    let pick1 = view.scene.pick(status.pointer[0].x, status.pointer[0].y)
    let pick2 = view.scene.pick(status.pointer[1].x, status.pointer[1].y)
    let position1 = pick1.ray.origin.add(
        pick1.ray.direction.scale(view.scene.activeCamera.radius)
    )
    let position2 = pick2.ray.origin.add(
        pick2.ray.direction.scale(view.scene.activeCamera.radius)
    )
    pickBox.position = position1.add(position2).scale(0.5)
    const viewMatrix = view.scene.activeCamera.getViewMatrix(true)
    let v1 = Vector3.TransformCoordinates(pick1.ray.origin, viewMatrix)
    let v2 = Vector3.TransformCoordinates(pick2.ray.origin, viewMatrix)
    let v3 = v2.subtract(v1)
    pickBox.scaling = new Vector3(
        v3.x,
        v3.y,
        view.scene.activeCamera.radius * 1.8
    )
    status.mesh.selected.region[0] = v1
    status.mesh.selected.region[1] = v2
}

function onPickEnd() {
    const view = useView()
    const status = view.scene.metadata.useStatus()
    const constant = view.scene.metadata.constant
    let intersectedPoints = new Set()
    let intersectedLines = new Set()
    const pickBox = view.control.pickBox
    pickBox.refreshBoundingInfo()
    const points = [...view.points.prep, ...view.points.rslt]
    points.forEach(point => {
        const mesh = point.mesh
        if (
            mesh.isVisible &&
            mesh.isPickable &&
            pickBox.intersectsMesh(mesh, true)
        ) {
            intersectedPoints.add(point.no)
        }
    })
    const lines = [...view.lines.prep, ...view.lines.rslt]
    lines.forEach(line => {
        const mesh = line.mesh
        if (
            mesh.isVisible &&
            mesh.isPickable &&
            pickBox.intersectsMesh(mesh, true)
        ) {
            intersectedLines.add(line.no)
        }
    })
    if (
        status.mode === constant.SELECTING.S ||
        status.mode === constant.SELECTING.A
    ) {
        intersectedPoints.forEach(no => {
            status.mesh.selected.node.add(no)
        })
        intersectedLines.forEach(no => {
            status.mesh.selected.elem.add(no)
        })
    } else if (status.mode == constant.SELECTING.U) {
        intersectedPoints.forEach(no => {
            status.mesh.selected.node.delete(no)
        })
        intersectedLines.forEach(no => {
            status.mesh.selected.elem.delete(no)
        })
    }
    view.control.hidePickBox()
    status.mode = constant.ROTATING
}

function onNodeSelected(now, pre) {
    const view = useView()
    let node = SetOperation(now, pre, 'delete')
    const points = [...view.points.prep, ...view.points.rslt]
    points
        .filter(point => node.has(point.no))
        .forEach(point =>
            point.updateMeshColor(view.scene.metadata.materials.point.selected)
        )
    node = SetOperation(pre, now, 'delete')
    points
        .filter(point => node.has(point.no))
        .forEach(point => point.updateMeshColor())
}
function onElemSelected(now, pre) {
    const view = useView()
    let elem = SetOperation(now, pre, 'delete')
    const config = view.scene.metadata.useConfig()
    const lines = [...view.lines.prep, ...view.lines.rslt]
    lines
        .filter(line => elem.has(line.no))
        .forEach(line => line.updateMeshColor(config.mesh.elem.color.selected))
    elem = SetOperation(pre, now, 'delete')
    lines
        .filter(line => elem.has(line.no))
        .forEach(line => line.updateMeshColor())
}

export {Control, alignTextWithLines, alignTextWithLine}
