import {markRaw} from 'vue'
import {useModelStore} from '../../../stores/model'
import {useStatusStore} from '../../../stores/status'
import {useView} from '../../../api/view/index'
import Config from './Config.vue'

const getMeshes = () => {
    const model = useModelStore()
    const view = useView()
    const status = view.scene.metadata.useStatus()
    const lockNode = new Set(model.categorized.node.lock.map(item => item.no))
    const lockElem = new Set(model.categorized.elem.lock.map(item => item.no))
    const points = status.mesh.visible.prepFree
        ? view.points.prep
        : [
            ...view.points.rslt,
            ...view.points.prep.filter(mesh =>
                lockNode.has(mesh.mesh.metadata.no)
            )
        ]
    const lines = status.mesh.visible.prepFree
        ? view.lines.prep
        : [
            ...view.lines.rslt,
            ...view.lines.prep.filter(mesh =>
                lockElem.has(mesh.mesh.metadata.no)
            )
        ]
    return {
        points: {
            all: points,
            selected: points.filter(point => status.mesh.selected.node.has(point.mesh.metadata.no))
        },
        lines: {
            all: lines,
            selected: lines.filter(point => status.mesh.selected.elem.has(point.mesh.metadata.no))
        }
    }
}
const activateSelectedMesh = () => {
    const { points, lines} = getMeshes()
    points.all.filter(point => point.mesh.isVisible).forEach(point => point.hide())
    lines.all.filter(line => line.mesh.isVisible).forEach(line => line.hide())
    points.selected.forEach(point => point.show())
    lines.selected.forEach(line => line.show())
    const view = useView()
    const status = view.scene.metadata.useStatus()
    status.mesh.selected.node.clear()
    status.mesh.selected.elem.clear()
}
const freezeSelectedMesh = () => {
    const { points, lines} = getMeshes()
    points.selected.forEach(point => point.hide())
    lines.selected.forEach(line => line.hide())
    const view = useView()
    const status = view.scene.metadata.useStatus()
    status.mesh.selected.node.clear()
    status.mesh.selected.elem.clear()
}
const activateAllMesh = () => {
    const { points, lines} = getMeshes()
    points.all.forEach(point => point.show())
    lines.all.forEach(line => line.show())
}
const freezeAllMesh = () => {
    const { points, lines} = getMeshes()
    points.all.forEach(point => point.hide())
    lines.all.forEach(line => line.hide())
}
const switchMeshNodeVisibility = () => {
    const view = useView()
    const status = view.scene.metadata.useStatus()
    status.mesh.visible.node = !status.mesh.visible.node
}
const switchTextBlockNodeVisibility = () => {
    const view = useView()
    const status = view.scene.metadata.useStatus()
    status.textBlock.visible.label.node = !status.textBlock.visible.label.node
    if (status.textBlock.visible.label.node) {
        view.points.rslt.forEach(point => point.updateLabelText())
    }
}
const switchTextBlockElemVisibility = () => {
    const view = useView()
    const status = view.scene.metadata.useStatus()
    status.textBlock.visible.label.elem = !status.textBlock.visible.label.elem
    if (status.textBlock.visible.label.elem) {
        view.lines.rslt.forEach(line => line.updateLabelText())
    }
}
const switchTextBlockTargetVisibility = () => {
    const view = useView()
    const status = view.scene.metadata.useStatus()
    status.textBlock.visible.target.all = !status.textBlock.visible.target.all
}
const meshViewConfig = () => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(Config)
    status.ui.dialog.show = true
}

export {
    activateSelectedMesh,
    freezeSelectedMesh,
    activateAllMesh,
    freezeAllMesh,
    switchMeshNodeVisibility,
    switchTextBlockNodeVisibility,
    switchTextBlockElemVisibility,
    switchTextBlockTargetVisibility,
    meshViewConfig
}
