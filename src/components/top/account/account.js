import { markRaw } from 'vue'
import { useStatusStore } from '../../../stores/status'
import Login from './Login.vue'
import Detail from './Detail.vue'

const showDialogAccountLogin = (e) => {
    const status = useStatusStore()
    status.ui.modal.component = markRaw(Login)
    status.ui.modal.show = true
}
const showDialogAccountDetail = (e) => {
    const status = useStatusStore()
    status.ui.modal.component = markRaw(Detail)
    status.ui.modal.show = true
}

export { showDialogAccountLogin, showDialogAccountDetail }