import { markRaw } from 'vue'
import { useStatusStore } from '../../../stores/status'
import NodeShape from './NodeShape.vue'
import ElemShape from './ElemShape.vue'
import ElemForce from './ElemForce.vue'
import Group from './Group.vue'

const showDialogTargetGroup = (e) => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(Group)
    status.ui.dialog.show = true
}
const showDialogTargetNodeShape = (e) => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(NodeShape)
    status.ui.dialog.show = true
}
const showDialogTargetElemShape = (e) => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(ElemShape)
    status.ui.dialog.show = true
}
const showDialogTargetElemForce = (e) => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(ElemForce)
    status.ui.dialog.show = true
}

export { showDialogTargetGroup, showDialogTargetNodeShape, showDialogTargetElemShape, showDialogTargetElemForce }