import { useView } from '../../../api/view/index'

export function test(){
    //验证修改model.node坐标，关联修改point、line坐标
    const view = useView()
    const model = view.scene.metadata.useModel()
    model.node[0].x += -10
    model.elem[0].no =  1111
    model.elem[0].jNode =   model.node[1]
    // console.log(model.node[0])
}