import { markRaw } from 'vue'
import { useStatusStore } from '../../../stores/status'
import Node from './Node.vue'
import Elem from './Elem.vue'
import Cnst from './Cnst.vue'
import Load from './Load.vue'
import Chrc from './Chrc.vue'


const showDialogNode = () => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(Node)
    status.ui.dialog.show = true
}
const showDialogElem = () => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(Elem)
    status.ui.dialog.show = true
}
const showDialogConstraint = () => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(Cnst)
    status.ui.dialog.show = true
}
const showDialogLoad = () => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(Load)
    status.ui.dialog.show = true
}
const showDialogCharacter = () => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(Chrc)
    status.ui.dialog.show = true
}



export { showDialogNode, showDialogElem, showDialogConstraint, showDialogLoad, showDialogCharacter }