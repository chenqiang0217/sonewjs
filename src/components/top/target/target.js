import { useStatusStore } from '../../../stores/status'
import NodeShape from './NodeShape.vue'
import ElemShape from './ElemShape.vue'
import ElemForce from './ElemForce.vue'
const showDialogTargetCatalog = (e) => {

}
const showDialogTargetNodeShape = (e) => {
    const status = useStatusStore()
    status.ui.dialog.component.is = NodeShape
    status.ui.dialog.show = true
    status.ui.dialog.title = '节点几何'
    status.ui.dialog.width = 250
}
const showDialogTargetElemShape = (e) => {
    const status = useStatusStore()
    status.ui.dialog.component.is = ElemShape
    status.ui.dialog.show = true
    status.ui.dialog.title = '单元几何'
    status.ui.dialog.width = 250
}
const showDialogTargetElemForce = (e) => {
    const status = useStatusStore()
    status.ui.dialog.component.is = ElemForce
    status.ui.dialog.show = true
    status.ui.dialog.title = '单元力'
    status.ui.dialog.width = 250
}

export { showDialogTargetCatalog, showDialogTargetNodeShape, showDialogTargetElemShape, showDialogTargetElemForce }