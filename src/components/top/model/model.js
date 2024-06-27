import { useStatusStore } from '../../../stores/status'
import Node from './Node.vue'
import Elem from './Elem.vue'
import Cnst from './Cnst.vue'
import Load from './Load.vue'


const showDialogNode = () => {
    const status = useStatusStore()
    status.ui.dialog.component.is = Node
    status.ui.dialog.show = true
    status.ui.dialog.title = '节点'
    status.ui.dialog.width = 250
}
const showDialogElem = () => {
    const status = useStatusStore()
    status.ui.dialog.component.is = Elem
    status.ui.dialog.show = true
    status.ui.dialog.title = '单元'
    status.ui.dialog.width = 250
}
const showDialogConstraint = () => {
    const status = useStatusStore()
    status.ui.dialog.component.is = Cnst
    status.ui.dialog.show = true
    status.ui.dialog.title = '支座'
    status.ui.dialog.width = 250
}
const showDialogLoad = () => {
    const status = useStatusStore()
    status.ui.dialog.component.is = Load
    status.ui.dialog.show = true
    status.ui.dialog.title = '荷载'
    status.ui.dialog.width = 250
}




export { showDialogNode, showDialogElem, showDialogConstraint, showDialogLoad }