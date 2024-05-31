
import { useView } from '../../../api/view/index'
const meshSelect = () => {
    const view = useView()
    const constant = view.scene.metadata.constant
    const status = view.scene.metadata.useStatus()
    status.mode = constant.SELECTING.S
}
const meshSelectAddition = () => {
    const view = useView()
    const constant = view.scene.metadata.constant
    const status = view.scene.metadata.useStatus()
    status.mode = constant.SELECTING.A
}
const meshUnselect = () => {
    const view = useView()
    const constant = view.scene.metadata.constant
    const status = view.scene.metadata.useStatus()
    status.mode = constant.SELECTING.U
}
const meshClearselect = () => {
    const view = useView()
    const constant = view.scene.metadata.constant
    const status = view.scene.metadata.useStatus()
    status.mode = constant.SELECTING.NONE
}
export { meshSelect, meshSelectAddition, meshUnselect, meshClearselect }