import { useModelStore} from '../../../stores/model'
import { Node, Elem } from '../../../api/model/index'
import { useStatusStore } from '../../../stores/status'
import { Dcel } from '../../../stores/dcel'
import { drawPointsInScene, drawLinesInScene, drawRibbonInScene, linkTextsWithMeshs } from '../../../stores/view'
import { byNumAsec } from '../../../api/utils'
import { CONSTANT } from '../../../stores/constant'
import { sleep } from '../../../api/utils'
const showDialogNode = () => {

}
const showDialogElem = () => {

}
const showDialogConstraint = () => {

}
const showDialogLoad = () => {

}

const generateDcelBySelectedElem = () => {
    const model = useModelStore()
    const status = useStatusStore()
    const elem = []
    const node = []
    status.view.mesh.selected.elem.forEach(no => {
        elem.push(model.elem.find(elem => elem.no == no))
    })
    const nos = new Set(elem.map(elem => [elem.iNode, elem.jNode]).flat())
    nos.forEach(no => {
        node.push(model.node.find(node => node.no == no))
    })
    return new Dcel(node, elem)
}

const generateFacets = (faces) => {
    const facets = []
    let i = 0
    faces.forEach(face => {
        if (!face.boundary) {
            face.facets.forEach(facet => {
                facets.push({
                    no: ++i,
                    node: facet.node.map(node => node.no),
                    elem: facet.elem,
                })
            })
        }
    })
    return facets
}
const drawFacets = async() => {
    const model = useModelStore()
    const status = useStatusStore()
    status.view.loading = true
    await sleep(0.1)
    //计算已存在的facet最大编号
    let maxFacetNo = model.facet.map(facet => facet.no).sort(byNumAsec).pop()
    if (maxFacetNo === undefined) {
        maxFacetNo = 0
    }
    const dcel = generateDcelBySelectedElem()
    const facets = generateFacets(dcel.faces)
    facets.forEach(facet => facet.no += maxFacetNo)
    model.facet.push(facets)
    drawRibbonInScene(facets)
    status.view.loading = false
}
const drawPyramids = async () => {
    const model = useModelStore()
    const status = useStatusStore()
    status.view.loading = true
    await sleep(0.1)
    const height = -3
    const dcel = generateDcelBySelectedElem()
    //计算已存在的facet最大编号
    let maxNodeNo = model.node.map(node => node.no).sort(byNumAsec).pop()
    let maxElemNo = model.elem.map(elem => elem.no).sort(byNumAsec).pop()
    const nodes = []
    const elems = []
    const pairs = Array.from(new Set(dcel.faces.map(face => face.elems).flat())).map(elem => ({
        elem,
        node: []
    }))
    dcel.faces.forEach(face => {
        if (!face.boundary) {
            const { x, y, z } = face.center.add(face.normal.scale(height))
            nodes.push(
                new Node([++maxNodeNo, x, y, z])
            )
            face.vertexs.forEach(vertex => {
                elems.push(
                    new Elem([++maxElemNo, 0, 1, 1, 1, maxNodeNo, vertex.no])
                )
            })
            face.elems.forEach(elem => {
                pairs.find(pair => pair.elem == elem).node.push(maxNodeNo)
            })
        }
    })
    pairs.forEach(pair => {
        let iNode = pair.node.shift()
        let jNode = pair.node.shift()
        if (iNode && jNode) {
            elems.push(
                new Elem([++maxElemNo, 0, 1, 1, 1, iNode, jNode])
            )
        }
    })
    nodes.forEach(node => {
        model.node.push(node)
    })
    elems.forEach(elem => {
        model.elem.push(elem)
    })
    const nodeNos = nodes.map(node => node.no)
    const elemNos = elems.map(elem => elem.no)
    drawPointsInScene(nodeNos)
    drawLinesInScene(elemNos)
    linkTextsWithMeshs(
        nodeNos.map(no => ({ no })),
        CONSTANT.VIEW.PREFIX.MESH.NODE.PREP
    )
    linkTextsWithMeshs(
        elemNos.map(no => ({ no })),
        CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP
    )
    nodeNos.forEach(no => {
        status.view.mesh.activated.node.prep.add(no)
        status.view.text.activated.node.prep.add(no)
    })
    elemNos.forEach(no => {
        status.view.mesh.activated.elem.prep.add(no)
        status.view.text.activated.elem.prep.add(no)
    })
    status.view.loading = false
}



export { showDialogNode, showDialogElem, showDialogConstraint, showDialogLoad, drawFacets, drawPyramids }