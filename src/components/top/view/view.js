import { useModelStore } from '../../../stores/model'
import { useView } from '../../../api/view/index'
import { alignTextWithLines } from '../../../api/view/control'


const viewMove = () => {
    const view = useView()
    const constant = view.scene.metadata.constant
    const status = view.scene.metadata.useStatus()
    status.mode = constant.ROTATING
}
const viewRotate = () => {
    const view = useView()
    const constant = view.scene.metadata.constant
    const status = view.scene.metadata.useStatus()
    status.mode = constant.ROTATING
}
const viewIsometric = () => {
    const view = useView()
    view.scene.activeCamera.setView(
        { direction: 'persp', bounding: view.bounding }
    )
    alignTextWithLines()
}
const viewTop = () => {
    const view = useView()
    view.scene.activeCamera.setView(
        { direction: 'z', bounding: view.bounding }
    )
    alignTextWithLines()
}
const viewFront = () => {
    const view = useView()
    view.scene.activeCamera.setView(
        { direction: 'y', bounding: view.bounding }
    )
    alignTextWithLines()
}
const viewRight = () => {
    const view = useView()
    view.scene.activeCamera.setView(
        { direction: 'x', bounding: view.bounding }
    )
    alignTextWithLines()
}

export { viewMove, viewRotate, viewIsometric, viewTop, viewFront, viewRight }