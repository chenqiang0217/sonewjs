import {defineStore} from 'pinia'
import {byNumAsec} from '../api/utils'
import {
    Node,
    Elem,
    Cnst,
    NodeShape,
    ElemShape,
    ElemForce
} from '../api/model/index'

const useModelStore = defineStore('model', {
    state: () => {
        return {
            node: [],
            elem: [],
            facet: [],
            cnst: [],
            target: {
                group: [{no: 1, label: 'basis'}],
                nodeShape: [],
                elemShape: [],
                elemForce: []
            },
            load: {
                group: [{no: 1, label: 'basis'}],
                node: {},
                elem: {}
            },
            result: []
        }
    },
    getters: {
        categorized: state => {
            const freeElem = state.elem.filter(elem => elem.type === Elem.TYPE.FREE)
            const freeNode = Array.from(
                new Set(freeElem.map(elem => [elem.iNode, elem.jNode]).flat())
            )

            const femType = Array.from(
                new Set(state.elem.map(elem => elem.femType))
            )
                .sort(byNumAsec)
                .map(no => ({
                    no,
                    label: no,
                    elem: state.elem.filter(elem => elem.femType === no)
                }))
            const mat = Array.from(new Set(state.elem.map(elem => elem.mat)))
                .sort(byNumAsec)
                .map(no => ({
                    no,
                    label: no,
                    elem: state.elem.filter(elem => elem.mat === no)
                }))
            const sec = Array.from(new Set(state.elem.map(elem => elem.sec)))
                .sort(byNumAsec)
                .map(no => ({
                    no,
                    label: no,
                    elem: state.elem.filter(elem => elem.sec === no)
                }))
            //cnst
            const cnst = Array.from(new Set(state.cnst.map(cnst => cnst.dim)))
                .sort(byNumAsec)
                .map(dim => {
                    return {
                        dim,
                        node: state.cnst.filter(cnst => cnst.dim === dim).map(cnst => cnst.node)
                    }
                })
            //nodeShape
            const nodeShape = state.target.group
                .map(group =>
                    Object.values(NodeShape.EQUALITY).map(equality => {
                        const node = new Set(
                            state.target.nodeShape
                                .filter(
                                    shape =>
                                        shape.equality === equality &&
                                        shape.group === group.no
                                )
                                .map(shape => [shape.nodePrm, shape.nodeSlv])
                                .flat()
                        )
                        node.delete(undefined)
                        return {
                            group: group.no,
                            equality,
                            node: Array.from(node)
                        }
                    })
                )
                .flat()
            const elemShape = state.target.group
                .map(group =>
                    Object.values(ElemShape.EQUALITY).map(equality => {
                        const elem = new Set(
                            state.target.elemShape
                                .filter(
                                    shape =>
                                        shape.equality === equality &&
                                        shape.group === group.no
                                )
                                .map(shape => [shape.elemPrm, shape.elemSlv])
                                .flat()
                        )
                        elem.delete(undefined)
                        return {
                            group: group.no,
                            equality,
                            elem: Array.from(elem)
                        }
                    })
                )
                .flat()
            const elemForce = state.target.group
                .map(group =>
                    Object.values(ElemForce.EQUALITY).map(equality => {
                        const elem = new Set(
                            state.target.elemForce
                                .filter(
                                    force =>
                                        force.equality === equality &&
                                        force.group === group.no
                                )
                                .map(force => [force.elemPrm, force.elemSlv])
                                .flat()
                        )
                        elem.delete(undefined)
                        return {
                            group: group.no,
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
        insertNode([no, x, y, z]) {
            this.node.push(new Node([no, x, y, z]))
        },
        insertElem([no, type, femType, mat, sec, iNodeNo, jNodeNo]) {
            const iNode = this.node.find(node => node.no === iNodeNo)
            const jNode = this.node.find(node => node.no === jNodeNo)
            if (iNode && jNode) {
                this.elem.push(
                    new Elem([no, type, femType, mat, sec, iNode, jNode])
                )
            }
        },
        insertCnst([no, nodeNo, dim, cs]) {
            const node = this.node.find(node => node.no === nodeNo)
            this.cnst.push(new Cnst([no, node, dim, cs]))
        },
        insertNodeShape([
            no,
            group,
            equality,
            type,
            dim,
            nodeNoPrm,
            nodeNoSlv,
            x,
            y,
            z
        ]) {
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
        insertElemShape([
            no,
            group,
            equality,
            type,
            dim,
            elemNoPrm,
            elemNoSlv,
            val1,
            val2,
            val3
        ]) {
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
                    val1,
                    val2,
                    val3
                ])
            )
        },
        insertElemForce([
            no,
            group,
            equality,
            type,
            dim,
            elemNoPrm,
            elemNoSlv,
            val
        ]) {
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

        clearResult() {
            this.result = []
        }
    }
})

export {useModelStore}
