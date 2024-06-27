import {defineStore} from 'pinia'
import {byNumAsec} from '../api/utils'
import {
    Node,
    Elem,
    Cnst,
    NodeShape,
    ElemShape,
    ElemForce,
    LoadGroup,
    TargetGroup,
    LoadStep,
    Substep,
    Cs
} from '../api/model/index'
import {useView} from '../api/view/index'

const useModelStore = defineStore('model', {
    state: () => {
        return {
            node: [],
            elem: [],
            facet: [],
            cnst: [],
            target: {
                group: [
                    new TargetGroup({no: 1, label: 'basis'}),
                    new TargetGroup({no: 2, label: 'test'})
                ],
                nodeShape: [],
                elemShape: [],
                elemForce: []
            },
            load: {
                group: [new LoadGroup({no: 1, label: 'basis'})],
                node: {},
                elem: {}
            },
            cs: [
                new Cs({no: 0, label: '世界坐标系'}),
                new Cs({no: 1, label: 'test'})
            ],
            loadStep: [
                new LoadStep('basis1', [], [new Substep()])
            ],
            result: []
        }
    },
    getters: {
        maxNo: state => {
            const nodeNos = state.node.map(node => node.no)
            nodeNos.push(0)
            const elemNos = state.elem.map(elem => elem.no)
            elemNos.push(0)
            const cnstNos = state.cnst.map(cnst => cnst.no)
            cnstNos.push(0)
            return {
                node: Math.max(...nodeNos),
                elem: Math.max(...elemNos),
                cnst: Math.max(...cnstNos)
            }
        },
        categorized: state => {
            const freeElem = state.elem.filter(
                elem => elem.eType === Elem.ETYPE.FREE
            )
            const freeNode = freeElem
                .map(elem => [elem.iNode, elem.jNode])
                .flat()
                .filter((item, index, arr) => arr.indexOf(item) === index)
            const femType = state.elem
                .map(elem => elem.femType)
                .filter((item, index, arr) => arr.indexOf(item) === index)
                .sort(byNumAsec)
                .map(no => ({
                    no,
                    label: no,
                    elem: state.elem.filter(elem => elem.femType === no)
                }))
            const mat = state.elem
                .map(elem => elem.mat)
                .filter((item, index, arr) => arr.indexOf(item) === index)
                .sort(byNumAsec)
                .map(no => ({
                    no,
                    label: no,
                    elem: state.elem.filter(elem => elem.mat === no)
                }))
            const sec = state.elem
                .map(elem => elem.sec)
                .filter((item, index, arr) => arr.indexOf(item) === index)
                .sort(byNumAsec)
                .map(no => ({
                    no,
                    label: no,
                    elem: state.elem.filter(elem => elem.sec === no)
                }))
            //cnst
            const cnst = state.cnst
                .map(cnst => cnst.dim)
                .filter((item, index, arr) => arr.indexOf(item) === index)
                .sort(byNumAsec)
                .map(dim => {
                    return {
                        dim,
                        node: state.cnst
                            .filter(cnst => cnst.dim === dim)
                            .map(cnst => cnst.node)
                    }
                })
            //nodeShape
            const nodeShape = state.target.group
                .map(group =>
                    Object.values(NodeShape.EQUALITY).map(equality => {
                        const node = state.target.nodeShape
                            .filter(
                                shape =>
                                    shape.equality === equality &&
                                    shape.group === group
                            )
                            .map(shape => [shape.nodePrm, shape.nodeSlv])
                            .flat()
                            .filter(item => item instanceof Node)
                            .filter(
                                (item, index, arr) =>
                                    arr.indexOf(item) === index
                            )
                        return {
                            group,
                            equality,
                            node: Array.from(node)
                        }
                    })
                )
                .flat()
            const elemShape = state.target.group
                .map(group =>
                    Object.values(ElemShape.EQUALITY).map(equality => {
                        const elem = state.target.elemShape
                            .filter(
                                shape =>
                                    shape.equality === equality &&
                                    shape.group === group
                            )
                            .map(shape => [shape.elemPrm, shape.elemSlv])
                            .flat()
                            .filter(item => item instanceof Elem)
                            .filter(
                                (item, index, arr) =>
                                    arr.indexOf(item) === index
                            )
                        return {
                            group,
                            equality,
                            elem: Array.from(elem)
                        }
                    })
                )
                .flat()
            const elemForce = state.target.group
                .map(group =>
                    Object.values(ElemForce.EQUALITY).map(equality => {
                        const elem = state.target.elemForce
                            .filter(
                                force =>
                                    force.equality === equality &&
                                    force.group === group
                            )
                            .map(force => [force.elemPrm, force.elemSlv])
                            .flat()
                            .filter(item => item instanceof Elem)
                            .filter(
                                (item, index, arr) =>
                                    arr.indexOf(item) === index
                            )
                        return {
                            group,
                            equality,
                            elem: Array.from(elem)
                        }
                    })
                )
                .flat()
            //
            return {
                node: {
                    all: state.node,
                    free: freeNode,
                    lock: state.node.filter(
                        node => !freeNode.find(freeNode => freeNode === node)
                    )
                },
                elem: {
                    all: state.elem,
                    free: freeElem,
                    lock: state.elem.filter(
                        elem => !freeElem.find(freeElem => freeElem === elem)
                    ),
                    femType,
                    mat,
                    sec
                },
                cnst: cnst,
                target: {
                    nodeShape: nodeShape,
                    elemShape: elemShape,
                    elemForce: elemForce
                }
            }
        }
    },
    actions: {
        createNode([no, x, y, z]) {
            const node = new Proxy(new Node([no, x, y, z]), {
                set: function (obj, prop, value, receiver) {
                    Reflect.set(obj, prop, value)
                    const view = useView()
                    view.points.prep
                        .find(point => point.mesh.metadata == receiver)
                        .updatePosition()
                        .updateLabel()
                    view.lines.prep
                        .filter(
                            line =>
                                line.mesh.metadata.iNode == receiver ||
                                line.mesh.metadata.jNode == receiver
                        )
                        .forEach(line => line.updatePosition())
                    return true
                }
            })
            const view = useView()
            const point = view.createPoint(node)
            this.node.push(node)
            // metadata必须采用model中的数据，因为model中的数据经过了proxy处理，直接采用node会导致view.points.prep[i].mesh.metadata与receiver不一致。
            point.mesh.metadata = this.node.at(-1)
            return this.node.at(-1)
        },
        removeNode(node) {
            const index = this.node.findIndex(item => item === node)
            const view = useView()
            //必须保证两数组数据一致
            if (index != -1) {
                view.points.prep[index].remove()
                view.points.prep.splice(index, 1)
                this.node.splice(index, 1)
            }
        },
        createElem([no, type, femType, mat, sec, iNodeNo, jNodeNo]) {
            const iNode = this.node.find(node => node.no === iNodeNo)
            const jNode = this.node.find(node => node.no === jNodeNo)
            if (iNode && jNode) {
                const elem = new Proxy(
                    new Elem([no, type, femType, mat, sec, iNode, jNode]),
                    {
                        set: function (obj, prop, value, receiver) {
                            Reflect.set(obj, prop, value)
                            const view = useView()
                            view.lines.prep
                                .find(l => l.mesh.metadata === receiver)
                                .updatePosition()
                                .updateLabel()
                            // iNode, jNode不能放到[]里面采用forEach
                            view.points.prep
                                .find(
                                    point =>
                                        point.mesh.metadata === receiver.iNode
                                )
                                .updateMeshColor()
                            view.points.prep
                                .find(
                                    point =>
                                        point.mesh.metadata === receiver.jNode
                                )
                                .updateMeshColor()
                            return true
                        }
                    }
                )
                const view = useView()
                const line = view.createLine(elem)
                this.elem.push(elem)
                line.mesh.metadata = this.elem.at(-1)
            }
        },
        removeElem(elem) {
            const index = this.elem.findIndex(item => item === elem)
            const view = useView()
            //必须保证两数组数据一致
            if (index != -1) {
                view.lines.prep[index].remove()
                view.lines.prep.splice(index, 1)
                this.elem.splice(index, 1)
            }
        },
        createCnst([no, nodeNo, dim, csNo]) {
            const node = this.node.find(node => node.no === nodeNo)
            const cs = this.cs.find(cs => cs.no === csNo)
            this.cnst.push(new Cnst([no, node, dim, cs]))
        },
        removeCnst(cnst) {
            const index = this.cnst.findIndex(item => item === cnst)
            if (index != -1) {
                this.cnst.splice(index, 1)
            }
        },
        createNodeShape([
            no,
            groupNo,
            equality,
            type,
            dim,
            nodeNoPrm,
            nodeNoSlv,
            x,
            y,
            z
        ]) {
            const group = this.target.group.find(group => group.no === groupNo)
            const nodePrm = this.node.find(node => node.no === nodeNoPrm)
            const nodeSlv = this.node.find(node => node.no === nodeNoSlv)
            this.target.nodeShape.push(
                new NodeShape([
                    no,
                    group,
                    equality,
                    type,
                    dim,
                    nodePrm,
                    nodeSlv,
                    x,
                    y,
                    z
                ])
            )
        },
        removeNodeShape(shape) {
            const index = this.target.nodeShape.findIndex(
                item => item === shape
            )
            if (index != -1) {
                this.target.nodeShape.splice(index, 1)
            }
        },
        createElemShape([
            no,
            groupNo,
            equality,
            type,
            dim,
            elemNoPrm,
            elemNoSlv,
            x,
            y,
            z
        ]) {
            const group = this.target.group.find(group => group.no === groupNo)
            const elemPrm = this.elem.find(elem => elem.no === elemNoPrm)
            const elemSlv = this.elem.find(elem => elem.no === elemNoSlv)
            this.target.elemShape.push(
                new ElemShape([
                    no,
                    group,
                    equality,
                    type,
                    dim,
                    elemPrm,
                    elemSlv,
                    x,
                    y,
                    z
                ])
            )
        },
        removeElemShape(shape) {
            const index = this.target.elemShape.findIndex(
                item => item === shape
            )
            if (index != -1) {
                this.target.elemShape.splice(index, 1)
            }
        },
        createElemForce([
            no,
            groupNo,
            equality,
            type,
            dim,
            elemNoPrm,
            elemNoSlv,
            val
        ]) {
            const group = this.target.group.find(group => group.no === groupNo)
            const elemPrm = this.elem.find(elem => elem.no === elemNoPrm)
            const elemSlv = this.elem.find(elem => elem.no === elemNoSlv)
            this.target.elemForce.push(
                new ElemForce([
                    no,
                    group,
                    equality,
                    type,
                    dim,
                    elemPrm,
                    elemSlv,
                    val
                ])
            )
        },
        removeElemForce(force) {
            const index = this.target.elemForce.findIndex(
                item => item === force
            )
            if (index != -1) {
                this.target.elemForce.splice(index, 1)
            }
        },
        createLoadStep({label, targetGroup, subStep, description}) {
            this.loadStep.push(
                new LoadGroup({label, targetGroup, subStep, description})
            )
        },
        clearResult() {
            this.result = []
        }
    }
})

export {useModelStore}
