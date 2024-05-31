// import { useStatusStore } from '../../../stores/status'
// import { setTextToMeshNo } from '../../../stores/view'
// import { CONSTANT } from '../../../stores/constant'
// import { ref } from 'vue'
import { useView } from '../../../api/view/index'

// const show = ref({
//     mesh: {
//         node: true,
//         elem: true,
//     },
//     label: {
//         node: false,
//         elem: false,
//     },
// })
const activeMesh = () => {
}
const freezeMesh = () => {
}
const switchMeshNodeVisibility = () => {
    // const status = useStatusStore()
    // status.view.mesh.visible.node = !status.view.mesh.visible.node
    const view = useView()
    const status = view.scene.metadata.useStatus()
    status.mesh.visible.node = !status.mesh.visible.node

}
const switchLabelNodelVisibility = () => {
    // const status = useStatusStore()
    // show.value.label.node = !show.value.label.node
    // if (status.mode === CONSTANT.MODE.RSLT) {
    //     setTextToMeshNo(CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT)
    // }
    // status.view.text.visible.node = show.value.label.node
    const view = useView()
    const status = view.scene.metadata.useStatus()
    status.text.visible.node = !status.text.visible.node
    if(status.text.visible.node){
        view.points.rslt.forEach(point => {
            point.text = point.no
        })
    }
}
const switchLabelElemVisibility = () => {
    // const status = useStatusStore()
    // show.value.label.elem = !show.value.label.elem
    // if (status.mode === CONSTANT.MODE.RSLT) {
    //     setTextToMeshNo(CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT, show.value.label.elem)
    // }
    // status.view.text.visible.elem = show.value.label.elem
    const view = useView()
    const status = view.scene.metadata.useStatus()
    status.text.visible.elem = !status.text.visible.elem
    if(status.text.visible.elem){
        view.lines.rslt.forEach(line => {
            line.text = line.no
        })
    }
}
const meshViewConfig = () => {
}

export { activeMesh, freezeMesh, switchMeshNodeVisibility, switchLabelNodelVisibility, switchLabelElemVisibility, meshViewConfig }
