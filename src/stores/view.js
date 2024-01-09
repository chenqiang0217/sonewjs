import {
    Engine, Scene, AxesViewer, ArcRotateCamera, Camera, Vector3, Vector2, MeshBuilder, Mesh, StandardMaterial, VertexBuffer,
    Color3, Color4
} from "@babylonjs/core"
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui"
import { watch } from 'vue'

import { useModelStore } from './model'
import { useConfigStore } from './config'
import { useStatusStore } from "./status"
import { CONSTANT } from './constant'
import { SetOperation } from '../api/utils'

const view = {
    scene: null,
    camera: null,
    pickBox: null,
    material: {
        point: {
            selected: null,
            unselected: {
                lock: null,
                free: null,
            },
            calculated: {
                deformed: null,
                undeformed: null,
            },
        },
        membrane: {
            selected: null,
            unselected: {
                lock: null,
                free: null,
            },
            calculated: {
                deformed: null,
                undeformed: null,
            },
        },
    },
    ui: null,
}

const createScene = (canvas) => {
    const model = useModelStore()
    const config = useConfigStore()
    const status = useStatusStore()

    const engine = new Engine(canvas)
    engine.disablePerformanceMonitorInBackground = true
    engine.preserveDrawingBuffer = false
    engine.premultipliedAlpha = false
    engine.enableOfflineSupport = false
    engine.doNotHandleContextLost = true
    view.scene = new Scene(engine)
    view.scene.clearColor = new Color3(1.00, 1.00, 1.00)
    view.scene.useRightHandedSystem = true
    view.scene.autoClearDepthAndStencil = false
    view.scene.blockMaterialDirtyMechanism = true
    view.scene.gravity = new Vector3(0, 0, 0)
    view.scene.collisionsEnabled = false

    view.camera = new ArcRotateCamera("camera1", 0.5, 0.5, 1000, Vector3.Zero(), view.scene)
    view.camera.setPosition(new Vector3(0, 0, 1000))
    view.camera.setTarget(Vector3.Zero())
    view.camera.attachControl(false)
    view.camera.mode = Camera.ORTHOGRAPHIC_CAMERA
    const viewSize = 100
    const ratio = canvas.width / canvas.height
    view.camera.orthoLeft = -viewSize / 2 * ratio
    view.camera.orthoRight = viewSize / 2 * ratio
    view.camera.orthoTop = viewSize / 2
    view.camera.orthoBottom = -viewSize / 2
    // view.camera.orthoLeft = -status.view.size.width / 2
    // view.camera.orthoRight = status.view.size.width / 2
    // view.camera.orthoTop = status.view.size.height / 2
    // view.camera.orthoBottom = -status.view.size.height / 2
    view.camera.panningSensibility = 100
    view.camera.inertia = 0.0
    //  view.camera.speed = 5.0
    //  view.camera.inputs.removeMouseWheel()
    view.camera.nodeViewSize = viewSize * config.view.node.sizePx / canvas.width

    // var worldOrigin = Vector3.Zero()
    // var xAxis = MeshBuilder.CreateLines("x", {points: [worldOrigin, (Axis.X).scale(viewSize/2)]}, view.scene)
    // var yAxis = MeshBuilder.CreateLines("y", {points: [worldOrigin, (Axis.Y).scale(viewSize/2)]}, view.scene)
    // var zAxis = MeshBuilder.CreateLines("z", {points: [worldOrigin, (Axis.Z).scale(viewSize/2)]}, view.scene)
    // // var cAxis = MeshBuilder.CreateDashedLines("c", {points: [ view.camera.target,  view.camera.position], updatable: true}, view.scene)
    // xAxis.color = Color3.Red()
    // yAxis.color = Color3.Green()
    // zAxis.color = Color3.Blue()
    //为便于旋转视图，以蓝色（z）为x轴，以红色（x）为y轴，以绿色（y）为z轴。
    // new AxesViewer(view.scene, viewSize / 10)

    view.material.point.selected = new StandardMaterial('pointeMatSelected', view.scene)
    view.material.point.unselected.lock = new StandardMaterial('pointeMatLock', view.scene)
    view.material.point.unselected.free = new StandardMaterial('pointeMatFree', view.scene)
    view.material.point.calculated.deformed = new StandardMaterial('pointeMatDeformed', view.scene)
    view.material.point.calculated.undeformed = new StandardMaterial('pointeMatUndeformed', view.scene)
    view.material.point.selected.emissiveColor = config.view.node.color.selected
    view.material.point.unselected.lock.emissiveColor = config.view.node.color.unselected.lock
    view.material.point.unselected.free.emissiveColor = config.view.node.color.unselected.free
    view.material.point.calculated.deformed.emissiveColor = config.view.node.color.calculated.deformed
    view.material.point.calculated.undeformed.emissiveColor = config.view.node.color.calculated.undeformed

    view.material.membrane.selected = new StandardMaterial('pointeMatSelected', view.scene)
    view.material.membrane.unselected.lock = new StandardMaterial('pointeMatLock', view.scene)
    view.material.membrane.unselected.free = new StandardMaterial('pointeMatFree', view.scene)
    view.material.membrane.calculated.deformed = new StandardMaterial('pointeMatDeformed', view.scene)
    view.material.membrane.calculated.undeformed = new StandardMaterial('pointeMatUndeformed', view.scene)
    view.material.membrane.selected.emissiveColor = config.view.membrane.color.selected
    view.material.membrane.unselected.lock.emissiveColor = config.view.membrane.color.unselected.lock
    view.material.membrane.unselected.free.emissiveColor = config.view.membrane.color.unselected.free
    view.material.membrane.calculated.deformed.emissiveColor = config.view.membrane.color.calculated.deformed
    view.material.membrane.calculated.undeformed.emissiveColor = config.view.membrane.color.calculated.undeformed


    // BABYLON.SceneLoader.Load("./", "mesh.obj", view.scene, function (scene) {
    //     // do something with the scene", "batman.obj", engine, function (scene) {
    //     // do something with the scene
    // });

    // nodeIconManager = new SpriteManager("nodeIconManager", "./public/node.png", MAXDNODEICON, 59, view.scene)
    //pickBox尺寸不能在camera外面，否则不显示。
    view.pickBox = MeshBuilder.CreateBox("box", { width: 1, height: 1, depth: 900 }, view.scene)
    view.pickBox.visibility = 0.0
    // pickBox.checkCollisions = false
    // pickBox.billboardMode = 7


    canvas.addEventListener("wheel", (evt) => {
        if ('wheelDelta' in evt) {
            let alpha = 1.2
            if (evt.wheelDelta > 1.0) {
                alpha = 1.0 / alpha
            }
            view.camera.orthoLeft /= alpha
            view.camera.orthoRight /= alpha
            view.camera.orthoTop /= alpha
            view.camera.orthoBottom /= alpha
            view.scene.meshes.filter(mesh => mesh.name.includes('n')).map(mesh => {
                mesh.scaling = mesh.scaling.scale(1 / alpha)
            })
        }
    })

    view.ui = AdvancedDynamicTexture.CreateFullscreenUI("ui", true, view.scene)


    // model.node.push(new Node([1, 0, 0, 0]))
    // model.node.push(new Node([2, 100, 0, 0]))
    // model.node.push(new Node([3, 100, 100, 100]))
    // model.elem.push(new Elem([1, 0, 1, 1, 1, 1, 2]))
    // model.elem.push(new Elem([2, 0, 1, 1, 1, 2, 3]))
    // model.elem.push(new Elem([3, 0, 1, 1, 1, 1, 3]))

    // drawPointsInScene(model.categorized.node.all)
    // drawLinesInScene(model.categorized.elem.all)
    // linkTextsWithMeshs(
    //     Array.from(model.categorized.node.all).map(no => ({ no })),
    //     CONSTANT.VIEW.PREFIX.MESH.NODE.PREP
    // )
    // linkTextsWithMeshs(
    //     Array.from(model.categorized.elem.all).map(no => ({ no })),
    //     CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP
    // )

    engine.runRenderLoop(() => {
        view.scene.render()
    })


    //监听新加入node
    watch(() => status.view.mesh.todo.draw.node, (node) => {
        Object.keys(node).forEach(key => {
            if (node[key]) {
                drawPointsInScene(node[key], CONSTANT.VIEW.PREFIX.MESH.NODE[key.toUpperCase()])
                node[key].forEach(no => status.view.mesh.activated.node[key].add(no))
                status.view.mesh.todo.draw.node[key].clear()
            }
        })
    }, { deep: true })
    //监听新加入elem
    watch(() => status.view.mesh.todo.draw.elem, (elem) => {
        Object.keys(elem).forEach(key => {
            if (elem[key]) {
                drawLinesInScene(elem[key], CONSTANT.VIEW.PREFIX.MESH.ELEM[key.toUpperCase()])
                elem[key].forEach(no => status.view.mesh.activated.elem[key].add(no))
                status.view.mesh.todo.draw.elem[key].clear()
            }
        })
    }, { deep: true })

    //监听新加入mesh的text
    // watch(() => status.view.text.todo.draw, ({ node, elem }) => {
    //     Object.keys(node).forEach(key => {
    //         if (node[key]) {
    //             let metadata = []
    //             node[key].forEach(no => metadata.push({ no }))
    //             linkTextsWithMeshs(metadata, CONSTANT.VIEW.PREFIX.MESH.NODE[key.toUpperCase()])
    //             status.view.text.todo.draw.node[key].clear()
    //         }
    //     })
    //     Object.keys(elem).forEach(key => {
    //         if (elem[key]) {
    //             let metadata = []
    //             elem[key].forEach(no => metadata.push({ no }))
    //             linkTextsWithMeshs(metadata, CONSTANT.VIEW.PREFIX.MESH.ELEM[key.toUpperCase()])
    //             status.view.text.todo.draw.elem[key].clear()
    //         }
    //     })
    // }, { deep: true })
    //
    //根据节点颜色设置更新节点颜色，只需更新节点的材料属性即可
    watch(() => config.view.node.color, (color) => {
        view.material.point.selected.emissiveColor = color.selected
        view.material.point.unselected.lock.emissiveColor = color.unselected.lock
        view.material.point.unselected.free.emissiveColor = color.unselected.free
    }, { deep: true })
    //根据单元颜色设置更新单元颜色
    watch(() => config.view.elem.color.selected, (color) => {
        const prefix = CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP
        status.view.mesh.selected.elem.forEach((no) => {
            view.scene.getMeshByName(prefix + no).color = color
        })
    }, { deep: true })
    watch(() => config.view.elem.color.unselected, ({ binding, ...colors }) => {
        const prefix = CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP
        SetOperation(model.categorized.elem.all, status.view.mesh.selected.elem, 'delete')
            .forEach((no) => {
                let line = view.scene.getMeshByName(prefix + no)
                let index = line.metadata[binding]
                line.color = colors[binding][index]
            })
    }, { deep: true })
    //更新选中、未选中节点颜色
    watch(
        () => new Set(Array.from(status.view.mesh.selected.node)),
        (now, pre) => {
            //RSLT模式下节点始终freeze
            const prefix = CONSTANT.VIEW.PREFIX.MESH.NODE.PREP
            let node = SetOperation(pre, now, 'delete')
            SetOperation(model.categorized.node.free, node, 'intersection').forEach((no) => {
                view.scene.getMeshByName(prefix + no).material = view.material.point.unselected.free
            })
            SetOperation(model.categorized.node.lock, node, 'intersection').forEach((no) => {
                view.scene.getMeshByName(prefix + no).material = view.material.point.unselected.lock
            })
            SetOperation(now, pre, 'delete').forEach((no) => {
                view.scene.getMeshByName(prefix + no).material = view.material.point.selected
            })
        }, { deep: true }
    )
    //更新选中、未选中单元颜色
    watch(
        () => new Set(Array.from(status.view.mesh.selected.elem)),
        (now, pre) => {
            const prefixPrep = CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP
            const prefixRslt = CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT
            //未选中单元颜色根据单元颜色设置确定
            let binding = config.view.elem.color.unselected.binding
            let elem = SetOperation(pre, now, 'delete')
            if (binding === CONSTANT.VIEW.COLOR.MESH.ELEM.UNSELECTEDBINDING.TYPE) {
                //颜色由type划分
                elem.forEach(no => {
                    let line = view.scene.getMeshByName(prefixPrep + no)
                    if (line) {
                        line.color = elem[binding] == 0 ?
                            config.view.elem.color.unselected.type.lock : config.view.elem.color.unselected.type.free
                    }

                })
            }
            else {
                //颜色由femType、mat、sec划分
                elem.forEach(no => {
                    let line = view.scene.getMeshByName(prefixPrep + no)
                    if (line) {
                        let index = line.metadata[binding]
                        line.color = config.view.elem.color.unselected[binding][index]
                    }
                })
            }
            elem.forEach(no => {
                let line = view.scene.getMeshByName(prefixRslt + no)
                if (line) {
                    //**等值线无法还原 */
                    line.color = config.view.elem.color.calculated.gadient
                }
            })
            //新选择的线
            SetOperation(now, pre, 'delete').forEach(no => {
                let line = view.scene.getMeshByName(prefixPrep + no)
                if (line) {
                    line.color = config.view.elem.color.selected
                }
                line = view.scene.getMeshByName(prefixRslt + no)
                if (line) {
                    line.color = config.view.elem.color.selected
                }
            })
        }, { deep: true }
    )
    //监听节点显示状态
    watch(() => status.view.mesh.visible.node, (visible) => {
        status.view.mesh.activated.node.prep.forEach(no => {
            view.scene.getMeshByName(CONSTANT.VIEW.PREFIX.MESH.NODE.PREP + no)
                .isVisible = visible
        })
        status.view.mesh.activated.node.rslt.forEach(no => {
            view.scene.getMeshByName(CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT + no)
                .isVisible = visible
        })
    })
    //监听节点text显示状态
    watch(() => status.view.text.visible.node, (visible) => {
        let prefix = CONSTANT.VIEW.PREFIX.TEXT + CONSTANT.VIEW.PREFIX.MESH.NODE.PREP
        status.view.text.activated.node.prep.forEach(no => {
            view.ui.getControlByName(prefix + no)
                .isVisible = visible
        })
        prefix = CONSTANT.VIEW.PREFIX.TEXT + CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT
        status.view.text.activated.node.rslt.forEach(no => {
            view.ui.getControlByName(prefix + no)
                .isVisible = visible
        })
    })
    //监听单元text显示状态
    watch(() => status.view.text.visible.elem, (visible) => {
        let prefix = CONSTANT.VIEW.PREFIX.TEXT + CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP
        status.view.text.activated.elem.prep.forEach(no => {
            view.ui.getControlByName(prefix + no)
                .isVisible = visible
        })
        prefix = CONSTANT.VIEW.PREFIX.TEXT + CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT
        status.view.text.activated.elem.rslt.forEach(no => {
            view.ui.getControlByName(prefix + no)
                .isVisible = visible
        })
    })
    //监听view.mode
    watch(() => status.view.mode, (mode) => {
        const meshPrefixs = [
            CONSTANT.VIEW.PREFIX.MESH.NODE.PREP,
            CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT,
            CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP,
            CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT,
        ]
        if (mode === CONSTANT.VIEW.ROTATING) {
            view.camera.attachControl(false)
            view.pickBox.visibility = 0.0
            view.scene.onPointerDown = () => {
                //旋转过程全部隐藏
                const labelPrefixs = meshPrefixs.map(prefix => CONSTANT.VIEW.PREFIX.TEXT + prefix)
                const regex = new RegExp(`^(${labelPrefixs.join('|')})\\d+$`)
                view.ui.getControlsByType('TextBlock').filter(textBlock => textBlock.name.match(regex))
                    .forEach(textBlock => {
                        textBlock.isVisible = false
                    })
            }
            view.scene.onPointerMove = null
            view.scene.onPointerUp = (evt) => {
                //旋转结束lines文字对齐lines
                if (evt.button === 0) {
                    alignTextWithMesh()
                }
                //本来已经关闭的，不用显示
                if (status.view.text.visible.node) {
                    let prefix = CONSTANT.VIEW.PREFIX.TEXT + meshPrefixs[0]
                    status.view.text.activated.node.prep.forEach(no => {
                        view.ui.getControlByName(prefix + no)
                            .isVisible = true
                    })
                    prefix = CONSTANT.VIEW.PREFIX.TEXT + meshPrefixs[1]
                    status.view.text.activated.node.rslt.forEach(no => {
                        view.ui.getControlByName(prefix + no)
                            .isVisible = true
                    })
                }
                if (status.view.text.visible.elem) {
                    let prefix = CONSTANT.VIEW.PREFIX.TEXT + meshPrefixs[2]
                    status.view.text.activated.elem.prep.forEach(no => {
                        view.ui.getControlByName(prefix + no)
                            .isVisible = true
                    })
                    prefix = CONSTANT.VIEW.PREFIX.TEXT + meshPrefixs[3]
                    status.view.text.activated.elem.rslt.forEach(no => {
                        view.ui.getControlByName(prefix + no)
                            .isVisible = true
                    })
                }
            }
        }
        else {
            view.camera.detachControl()
            view.scene.onPointerDown = onSelectPointerDown
            view.scene.onPointerUp = onSelectPointerUp
            switch (mode) {
                case CONSTANT.VIEW.SELECTING.S:
                    status.view.mesh.selected.node.clear()
                    status.view.mesh.selected.elem.clear()
                    break
                case CONSTANT.VIEW.SELECTING.A:
                    break
                case CONSTANT.VIEW.SELECTING.U:
                    break
                case CONSTANT.VIEW.SELECTING.NONE:
                    status.view.mesh.selected.node.clear()
                    status.view.mesh.selected.elem.clear()
                    view.camera.attachControl(false)
                    view.scene.onPointerDown = null
                    view.scene.onPointerUp = null
                    status.view.mode = CONSTANT.VIEW.ROTATING
                    break
            }
        }
    }, { immediate: true })

    // 监听mesh的todo,包括node，elem的activate和freeze
    const actionKeys = ['activate', 'freeze']
    const meshKeys = ['node', 'elem']
    const keys = ['prep', 'rslt']
    actionKeys.forEach((actionKey, index) => {
        meshKeys.forEach(meshKey => {
            watch(status.view.mesh.todo[actionKey][meshKey], (mesh) => {
                keys.forEach(key => {
                    let meshPrefix = CONSTANT.VIEW.PREFIX.MESH[meshKey.toUpperCase()][key.toUpperCase()]
                    let nos = mesh[key]
                    if (index == 0) {
                        activateMeshs(nos, meshPrefix)
                        nos.forEach(no => status.view.mesh.activated[meshKey][key].add(no))
                    }
                    else {
                        freezeMeshs(nos, meshPrefix)
                        nos.forEach(no => status.view.mesh.activated[meshKey][key].delete(no))
                    }
                    status.view.mesh.todo[actionKey][meshKey][key].clear()
                })
            })
        })
    })
    // 监听text的activated
    meshKeys.forEach(meshKey => {
        keys.forEach(key => {
            watch(status.view.text.activated[meshKey][key], (now, pre) => {
                + CONSTANT.VIEW.PREFIX.MESH[meshKey.toUpperCase()][key.toUpperCase()]
                if (visible) {
                    const visible = status.view.text.visible[meshKey]
                    const prefix = CONSTANT.VIEW.PREFIX.TEXT
                    SetOperation(pre, now, 'delete').forEach(no => {
                        view.ui.getControlByName(prefix + no).isVisible = false
                    })
                }
            })
        })
    })
}

const resetViewRatio = ({ width, height }) => {
    view.camera.orthoRight = view.camera.orthoTop / height * width
    view.camera.orthoLeft = - view.camera.orthoRight
}


const activateMeshs = (nos, meshPrefix) => {
    nos.forEach(no => {
        view.scene.meshes.find(mesh => mesh.name == meshPrefix + no)
            .mesh.isVisible = true
    })
}
const freezeMeshs = (nos, meshPrefix) => {
    nos.forEach(no => {
        let mesh = view.scene.meshes.find(mesh => mesh.name == meshPrefix + no)
        if (mesh) {
            mesh.isVisible = false
        }
    })
}
const setTextToMeshNo = (meshPrefix) => {
    const lebelPrefix = CONSTANT.VIEW.PREFIX.TEXT + meshPrefix
    const regex = new RegExp(`^(${lebelPrefix})\\d+$`)
    view.ui.getControlsByType('TextBlock').filter(textBlock => textBlock.name.match(regex))
        .forEach(textBlock => {
            textBlock.text = textBlock.metadata.no
        })
}
const alignTextWithMesh = () => {
    const prefixs = [CONSTANT.VIEW.PREFIX.TEXT + CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP,
    CONSTANT.VIEW.PREFIX.TEXT + CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT]
    // // /^(tl|trl)\d+$/
    let regex = new RegExp(`^(${prefixs.join('|')})\\d+$`)
    view.ui.getControlsByType('TextBlock').filter(textBlock => textBlock.name.match(regex))
        .forEach(textBlock => {
            let mesh = textBlock.linkedMesh
            let points = mesh.getVerticesData(VertexBuffer.PositionKind)
            let aPoint = Vector3.FromArray(points, 0)
            let bPoint = Vector3.FromArray(points, 3)
            let { x, y } = Vector3.TransformNormal(bPoint.subtract(aPoint), view.camera.getViewMatrix())
            let v1 = new Vector2(x, y)
            v1.normalize()
            if (v1.x < 0) {
                v1 = v1.negate()
            }
            let v2 = new Vector2(-v1.y, v1.x)
            textBlock.rotation = - Math.asin(v1.y)
            textBlock.linkOffsetXInPixels = textBlock.fontSizeInPixels * v2.x * 0.5
            textBlock.linkOffsetYInPixels = -textBlock.fontSizeInPixels * v2.y * 0.5
        })
}
const onSelectPointerDown = (evt, pickInfo) => {
    //  view.camera.alpha:绕y轴的角度，从x轴起算
    //  view.camera.beta：绕x轴的角度，从y轴起算
    const status = useStatusStore()
    // viewMatrix =  view.camera.getViewMatrix(true)
    view.pickBox.rotation.x = -Math.PI / 2 + view.camera.beta
    view.pickBox.rotation.y = Math.PI / 2 - view.camera.alpha

    // view.status.pointer[0] = { x: view.scene.pointerX, y: view.scene.pointerY }
    status.view.pointer[0] = { x: view.scene.pointerX, y: view.scene.pointerY }

    let pickResult = view.scene.pick(view.scene.pointerX, view.scene.pointerY)
    view.pickBox.position = pickResult.ray.origin.add(pickResult.ray.direction.scale(200))
    view.scene.onPointerMove = onSelectPointerMove
    view.scene.onPointerDown = null
}

const onSelectPointerMove = (evt, pickInfo) => {
    const status = useStatusStore()
    view.pickBox.visibility = 0.5
    // view.status.pointer[1] = { x: view.scene.pointerX, y: view.scene.pointerY }
    // let pick1 = view.scene.pick(view.status.pointer[0].x, view.status.pointer[0].y)
    // let pick2 = view.scene.pick(view.status.pointer[1].x, view.status.pointer[1].y)
    status.view.pointer[1] = { x: view.scene.pointerX, y: view.scene.pointerY }
    let pick1 = view.scene.pick(status.view.pointer[0].x, status.view.pointer[0].y)
    let pick2 = view.scene.pick(status.view.pointer[1].x, status.view.pointer[1].y)

    let position1 = pick1.ray.origin.add(pick1.ray.direction.scale(view.camera.radius))
    let position2 = pick2.ray.origin.add(pick2.ray.direction.scale(view.camera.radius))
    view.pickBox.position = position1.add(position2).scale(0.5)
    const viewMatrix = view.camera.getViewMatrix(true)
    let v1 = Vector3.TransformCoordinates(pick1.ray.origin, viewMatrix)
    let v2 = Vector3.TransformCoordinates(pick2.ray.origin, viewMatrix)
    let v3 = v2.subtract(v1)
    view.pickBox.scaling.x = v3.x
    view.pickBox.scaling.y = v3.y
    // view.status.selected.region[0] = v1
    // view.status.selected.region[1] = v2
    status.view.mesh.selected.region[0] = v1
    status.view.mesh.selected.region[1] = v2
}
const onSelectPointerUp = () => {
    const status = useStatusStore()
    // const pointRegex = /^(n|rn)\d+$/ //以n或rn开头，至少1个数字结尾，中间无其他字符
    // const lineRegex = /^(l|rl)\d+$/ //以l或rl开头，至少1个数字结尾，中间无其他字符
    const NumberRegex = /\d+$/ //至少1个数字结尾
    let prefixs = [CONSTANT.VIEW.PREFIX.MESH.NODE.PREP, CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT]
    const pointRegex = new RegExp(`^(${prefixs.join('|')})\\d+$`)
    prefixs = [CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP, CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT]
    const lineRegex = new RegExp(`^(${prefixs.join('|')})\\d+$`)
    let intersectedPoints = new Set()
    let intersectedLines = new Set()
    view.pickBox.refreshBoundingInfo()
    view.scene.getActiveMeshes().data.forEach(mesh => {
        if (mesh.name.match(pointRegex) && mesh.isVisible && view.pickBox.intersectsMesh(mesh, true)) {
            intersectedPoints.add(parseInt(mesh.name.match(NumberRegex).shift()))
        }
        if (mesh.name.match(lineRegex) && mesh.isVisible && view.pickBox.intersectsMesh(mesh, true)) {
            intersectedLines.add(parseInt(mesh.name.match(NumberRegex).shift()))
        }
    })
    if (status.view.mode === CONSTANT.VIEW.SELECTING.S || status.view.mode === CONSTANT.VIEW.SELECTING.A) {
        intersectedPoints.forEach(no => {
            status.view.mesh.selected.node.add(no)
        })
        intersectedLines.forEach(no => {
            status.view.mesh.selected.elem.add(no)
        })
    } else if (status.view.mode == CONSTANT.VIEW.SELECTING.U) {
        intersectedPoints.forEach(no => {
            status.view.mesh.selected.node.delete(no)
        })
        intersectedLines.forEach(no => {
            status.view.mesh.selected.elem.delete(no)
        })
    }
    // console.log(status.view.mesh.selected.elem)
    //防止按下直接弹起bug
    status.view.mode = CONSTANT.VIEW.ROTATING
    // toViewMode()
}

/** 
* @function 添加节点至视图
* @param {Number[]} nodes node编号数组或集合
* @param {String} prefix point名称前缀 'n'|'rn'
* @return void
*/

const drawPointsInScene = (nos, prefix = CONSTANT.VIEW.PREFIX.MESH.NODE.PREP, step = 0) => {
    const model = useModelStore()
    const config = useConfigStore()
    const freeNode = model.categorized.node.free
    let sizePx = config.view.node.sizePx
    let option = { height: 1, width: 1, sideOrientation: Mesh.DOUBLESIDE }
    let nodes
    if (prefix === CONSTANT.VIEW.PREFIX.MESH.NODE.PREP) {
        nodes = model.node
    }
    else {
        nodes = model.result.find(res => res.step == step).node
    }
    nos.forEach(no => {
        let pointName = prefix + no
        let point = view.scene.getMeshByName(pointName)
        if (!point) {
            //point不存在
            point = MeshBuilder.CreatePlane(pointName, option)
            point.scaling = point.scaling.scale(sizePx)
            point.billboardMode = 7
            if (prefix === CONSTANT.VIEW.PREFIX.MESH.NODE.PREP) {
                if (freeNode.has(no)) {
                    point.material = view.material.point.unselected.free
                }
                else {
                    point.material = view.material.point.unselected.lock
                }
            }
            else {
                point.material = view.material.point.calculated.deformed
            }
        }
        // point.position = new Vector3(node.x, node.y, node.z)
        let node = nodes.find(node => node.no == no)
        // point.position = new Vector3(node.y, node.z, node.x)
        point.position = node.positionInScene
        point.isVisible = true
    })
}

/** 
* @function 添加单元至视图
* @param {Number[]} nos elem数组或集合
* @param {String} prefix line名称前缀 'l'|'rl'
* @return void
*/
const drawLinesInScene = (nos, linePrefix = CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP) => {
    const model = useModelStore()
    const config = useConfigStore()
    nos.forEach(no => {
        let elem = model.elem.find(elem => elem.no == no)
        let points = []
        let pointPrefix = CONSTANT.VIEW.PREFIX.MESH.NODE.PREP
        if (linePrefix !== CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP) {
            pointPrefix = CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT
        }
        let iPoint = view.scene.getMeshByName(pointPrefix + elem.iNode)
        let jPoint = view.scene.getMeshByName(pointPrefix + elem.jNode)
        let lineName = linePrefix + elem.no
        if (iPoint && jPoint) {
            points.push(iPoint.position)
            points.push(jPoint.position)
            let line = view.scene.getMeshByName(lineName)
            let meta = { no }
            if (line) {
                line = MeshBuilder.CreateLines(null, { points, instance: line })
                line.refreshBoundingInfo()
            }
            else {
                line = MeshBuilder.CreateLines(lineName, { points, updatable: true }, view.scene, true)
                if (linePrefix === CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP) {
                    let binding = config.view.elem.color.unselected.binding
                    if (binding === CONSTANT.VIEW.COLOR.MESH.ELEM.UNSELECTEDBINDING.TYPE) {
                        line.color = elem[binding] == 0 ? config.view.elem.color.unselected.type.lock : config.view.elem.color.unselected.type.free
                    }
                    else {
                        let no = elem[binding]
                        line.color = config.view.elem.color.unselected[binding][no]
                    }
                }
                else {
                    line.color = config.view.elem.color.calculated.deformed
                }
            }
            meta.type = elem.type
            meta.femType = elem.femType
            meta.mat = elem.mat
            meta.sec = elem.sec
            line.metadata = meta
            line.isVisible = true
        }
    })
}

/** 
* @function 添加单元至视图
* @param {Number[]} nos elem数组或集合
* @param {String} prefix line名称前缀 'l'|'rl'
* @return void
*/
const drawRibbonInScene = (facets, Meshrefix = CONSTANT.VIEW.PREFIX.MESH.MEMBRANE.PREP) => {
    const model = useModelStore()
    facets.forEach(facet => {
        const facetName = Meshrefix + facet.no
        const points = facet.node.map(no =>
            model.node.find(node => node.no == no).positionInScene
        )
        let ribbon = MeshBuilder.CreateRibbon(facetName,
            { pathArray: [points], closePath: true, sideOrientation: Mesh.DOUBLESIDE }
        )
        ribbon.material = view.material.membrane.unselected.lock
    })
}

/** 
* @function 添加TextBlock,并绑定至mesh,只绑定不显示
* @param {Object[]} metadata 对象数组或集合
* @param {number} metadata[].no mesh编号
* @param {String} metadata[].text 文本
* @param {String} meshPrefix 名称前缀 'rn'或'n'或'rl'或'l'
* @param {Boolean} showNow 是否强制显示
* @return void
*/
const linkTextsWithMeshs = (metadata, meshPrefix) => {
    const model = useModelStore()
    const config = useConfigStore()
    const status = useStatusStore()
    let labelPrefix = CONSTANT.VIEW.PREFIX.TEXT + meshPrefix
    let visible
    if (meshPrefix === CONSTANT.VIEW.PREFIX.MESH.NODE.PREP || meshPrefix === CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT) {
        visible = status.view.text.visible.node
    }
    else {
        visible = status.view.text.visible.elem
    }
    metadata.forEach(meta => {
        let meshName = meshPrefix + meta.no
        let labelName = labelPrefix + meta.no
        let label = view.ui.getControlByName(labelName)
        if (!label) {
            label = new TextBlock()
            label.name = labelName
            view.ui.addControl(label)
            label.linkWithMesh(
                view.scene.getMeshByName(meshName)
            )
            if (meshPrefix === CONSTANT.VIEW.PREFIX.MESH.NODE.PREP || meshPrefix === CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT) {
                label.fontSizeInPixels = config.view.text.node.sizePx
                label.color = config.view.text.node.color
                label.linkOffsetYInPixels = -label.fontSizeInPixels * 0.6
            }
            else {
                label.fontSizeInPixels = config.view.text.elem.sizePx
                label.color = config.view.text.elem.color
                let mesh = model.elem.find(elem => elem.no == meta.no)
                meta.type = mesh.type
                meta.femType = mesh.femType
                meta.mat = mesh.mat
                meta.sec = mesh.sec
            }
        }
        label.metadata = meta
        label.text = meta.text ?? meta.no
        label.isVisible = visible
    })
    if (meshPrefix === CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP || meshPrefix === CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT) {
        alignTextWithMesh()
    }
}


/** 
* @function 设置单元渐变色
* @param {Number[]} nos elem数组或集合
* @param {String} prefix line名称前缀 'l'|'rl'
* @return void
*/
const setGadientColorForLines = (nos, step) => {
    const model = useModelStore()
    const config = useConfigStore()
    const linePrefix = CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT
    nos.forEach(no => {
        const { elem, summarized } = model.result.find(res => res.step === step)
        const by = config.view.elem.color.calculated.gadient.by
        const nSec = config.view.elem.color.calculated.gadient.nSec
        let value = elem.find(elem => elem.no == no)[by]
        let min = summarized[by].min
        let max = summarized[by].max
        let i = Math.round(
            (value - min) / (max - min) * (nSec - 1)
        )
        view.scene.getMeshByName(linePrefix + no).color = config.elemGadientColors[i]
    })
}

/** 
* @function 清除视图中mesh
* @param {Number[]} nos mesh编号数组
* @param {String} meshPrefix mesh编号前缀 'n'|'l'|'rn'|'rl'
* @return void
*/
const clearMeshsInScene = (nos, meshPrefix) => {
    clearTextsInScene(nos, meshPrefix)
    nos.forEach(no => {
        let mesh = view.scene.getMeshByName(meshPrefix + no)
        //去除观察者、被观察者
        //...
        //...
        view.scene.removeMesh(mesh)
    })

}

/** 
* @function 清除TextBlock
* @param {Number[]} nos TextBlock编号
* @param {String} meshPrefix mesh编号前缀 'n'|'l'|'rn'|'rl'
* @return void
*/
const clearTextsInScene = (nos, meshPrefix) => {
    let labelPrefix = CONSTANT.VIEW.PREFIX.TEXT + meshPrefix
    nos.forEach(no => {
        view.ui.removeControl(
            view.ui.getControlByName(labelPrefix + no)
        )
    })
}

function resetCamera(boundingInfo) {
    let v1 = new Vector3(boundingInfo.xMin, boundingInfo.yMin, boundingInfo.zMin)
    let v2 = new Vector3(boundingInfo.xMax, boundingInfo.yMax, boundingInfo.zMax)
    let target = v2.add(v1).scale(0.5)
    let r = v2.subtract(v1).length()
    let position = target.add(new Vector3(0, 0, r))
    // view.pickBox.position = target
    view.pickBox.scaling.z = 1.5 * r

    view.camera.setTarget(target)
    view.camera.setPosition(position)
    let sx = v2.subtract(v1).x / (view.camera.orthoRight - view.camera.orthoLeft)
    let sy = v2.subtract(v1).y / (view.camera.orthoTop - view.camera.orthoBottom)
    let s = sx
    if (sx < sy) s = sy
    view.camera.orthoLeft *= s
    view.camera.orthoRight *= s
    view.camera.orthoTop *= s
    view.camera.orthoBottom *= s
    view.camera.nodeViewSize *= s
}

export {
    view, createScene, resetCamera, resetViewRatio, drawPointsInScene, drawLinesInScene, drawRibbonInScene, linkTextsWithMeshs,
    clearMeshsInScene, clearTextsInScene, setGadientColorForLines, setTextToMeshNo,
}