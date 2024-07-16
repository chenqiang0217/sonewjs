// import { useView } from '../../../api/view/index'
import {task} from '../../../api/request'
import {base64ToFloat64Array} from '../../../api/utils'

export async function test() {
    //验证修改model.node坐标，关联修改point、line坐标
    // const view = useView()
    // const model = view.scene.metadata.useModel()
    // model.node[0].x += -10
    // model.target.nodeShape[0].nodeSlv = model.node[4]
    // console.log(model.node[0])
    // const status = view.scene.metadata.useStatus()
    // status.textBlock.visible.target.elemForce.all = !status.textBlock.visible.target.elemForce.all
    // const formData = new FormData()
    // formData.append('config', JSON.stringify({a: [1,2,3]}))
    // const response = task.test(formData, handleData)
    setTimeout(()=>{
        console.log('.....')
    }, Number.POSITIVE_INFINITY)
}
// function handleData(results){
//     // console.log(results)
//     results.forEach(result => {
//         let step = result.step
//         let rsdl = [].slice.call(base64ToFloat64Array(result.rsdl))
//         let x = [].slice.call(base64ToFloat64Array(result.x))
//         console.log(step, rsdl, x)
//     })
// }
