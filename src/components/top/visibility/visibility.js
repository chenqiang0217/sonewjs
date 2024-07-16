import {markRaw} from 'vue'
import {useView} from '../../../api/view/index'
import {useStatusStore} from '../../../stores/status'
import Config from './Config.vue'

const activeMesh = () => {}
const freezeMesh = () => {}
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
const switchTextBlockTargetisibility = () => {
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
    activeMesh,
    freezeMesh,
    switchMeshNodeVisibility,
    switchTextBlockNodeVisibility,
    switchTextBlockElemVisibility,
    switchTextBlockTargetisibility,
    meshViewConfig
}
