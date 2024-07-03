import { useView } from '../../../api/view/index'

export function test(){
    //验证修改model.node坐标，关联修改point、line坐标
    const view = useView()
    // const model = view.scene.metadata.useModel()
    // model.node[0].x += -10
    // model.target.nodeShape[0].nodeSlv = model.node[4]
    // console.log(model.node[0])
    const status = view.scene.metadata.useStatus()
    status.textBlock.visible.target.elemForce.all = !status.textBlock.visible.target.elemForce.all
}