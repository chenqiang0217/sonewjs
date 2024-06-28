import { useStatusStore } from '../../../stores/status'
import NodeShape from './NodeShape.vue'
import ElemShape from './ElemShape.vue'
import ElemForce from './ElemForce.vue'
import Group from './Group.vue'

const showDialogTargetGroup = (e) => {
    const status = useStatusStore()
    status.ui.dialog.component.is = Group
    status.ui.dialog.show = true
    status.ui.dialog.title = '目标组别'
    status.ui.dialog.width = 500
    status.ui.dialog.alginCenter = false
}
const showDialogTargetNodeShape = (e) => {
    const status = useStatusStore()
    status.ui.dialog.component.is = NodeShape
    status.ui.dialog.show = true
    status.ui.dialog.title = '节点几何'
    status.ui.dialog.width = 250
    status.ui.dialog.alginCenter = false
}
const showDialogTargetElemShape = (e) => {
    const status = useStatusStore()
    status.ui.dialog.component.is = ElemShape
    status.ui.dialog.show = true
    status.ui.dialog.title = '单元几何'
    status.ui.dialog.width = 250
    status.ui.dialog.alginCenter = false
}
const showDialogTargetElemForce = (e) => {
    const status = useStatusStore()
    status.ui.dialog.component.is = ElemForce
    status.ui.dialog.show = true
    status.ui.dialog.title = '单元力'
    status.ui.dialog.width = 250
    status.ui.dialog.alginCenter = false
}

export { showDialogTargetGroup, showDialogTargetNodeShape, showDialogTargetElemShape, showDialogTargetElemForce }