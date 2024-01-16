import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { view } from '../../../stores/view'



const viewMove = (e) => {
    const status = useStatusStore()
}
const viewRotate = (e) => {
    const status = useStatusStore()
}
const viewIsometric = (e) => {
    const model = useModelStore()
    view.scene.activeCamera.setView(
        { direction: 'persp', bounding: model.bounding }
    )
}
const viewTop = (e) => {
    const model = useModelStore()
    view.scene.activeCamera.setView(
        { direction: 'z', bounding: model.bounding }
    )
}
const viewFront = (e) => {
    const model = useModelStore()
    view.scene.activeCamera.setView(
        { direction: 'y', bounding: model.bounding }
    )
}
const viewRight = (e) => {
    const model = useModelStore()
    view.scene.activeCamera.setView(
        { direction: 'x', bounding: model.bounding }
    )
}

export { viewMove, viewRotate, viewIsometric, viewTop, viewFront, viewRight }