
import { useStatusStore } from '../../../stores/status'
import { CONSTANT } from '../../../stores/constant'
const meshSelect = (e) => {
    const status = useStatusStore()
    status.view.mode = CONSTANT.VIEW.SELECTING.S
}
const meshSelectAddition = (e) => {
    const status = useStatusStore()
    status.view.mode = CONSTANT.VIEW.SELECTING.A
}
const meshUnselect = (e) => {
    const status = useStatusStore()
    status.view.mode = CONSTANT.VIEW.SELECTING.U
}
const meshClearselect = (e) => {
    const status = useStatusStore()
    status.view.mode = CONSTANT.VIEW.SELECTING.NONE
}
export { meshSelect, meshSelectAddition, meshUnselect, meshClearselect }