import { useView } from '../../../api/view/index'

export function test(){
    //验证修改model.node坐标，关联修改point、line坐标
    const view = useView()
    const model = view.scene.metadata.useModel()
    model.node[0].x += -10
    view.points.prep.find(point => point.mesh.metadata === model.node[0]).updatePosition()
    console.log(model.node[0])
}