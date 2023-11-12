import { defineStore } from 'pinia'
import { sortNumber, SetOperation } from '../api/utils'
import { Vector3 } from "@babylonjs/core"

const TARGETTYPE = [{ no: 0, label: 'EQ' }, { no: 1, label: 'GT' }, { no: 2, label: 'LT' }]

class Node {
    constructor([no, x, y, z]) {
        this.no = no
        this.x = x
        this.y = y
        this.z = z
    }
    get position() {
        return new Vector3(this.x, this.y, this.z)
    }
    get positionInScene() {
        return new Vector3(this.y, this.z, this.x)
    }
    toArray() {
        return [this.no, this.x, this.y, this.z]
    }
}
class Elem {
    constructor([no, type, femType, mat, sec, iNode, jNode]) {
        this.no = no
        this.type = type
        this.femType = femType
        this.mat = mat
        this.sec = sec
        this.iNode = iNode
        this.jNode = jNode
    }
    toArray() {
        return [this.no, this.type, this.femType, this.mat, this.sec, this.iNode, this.jNode]
    }
}
class Cnst {
    constructor([no, node, type, cs]) {
        this.no = no
        this.node = node
        this.type = type
        this.cs = cs
    }
    toArray() {
        return [this.no, this.node, this.type, this.cs]
    }
}
class NodeShape {
    constructor([no, group, type, dim, nodePrm, nodeSlv, x, y, z]) {
        this.no = no
        this.group = group
        this.type = type
        this.dim = dim
        this.nodePrm = nodePrm
        this.nodeSlv = nodeSlv
        this.x = x
        this.y = y
        this.z = z
    }
    toArray() {
        return [this.no, this.group, this.type, this.dim, this.nodePrm, this.nodeSlv, this.x, this.y, this.z]
    }
}
class ElemShape {
    constructor([no, group, type, dim, elemPrm, elemSlv, val1, val2, val3]) {
        this.no = no
        this.group = group
        this.type = type
        this.dim = dim
        this.elemPrm = elemPrm
        this.elemSlv = elemSlv
        this.val1 = val1
        this.val2 = val2
        this.val3 = val3
    }
    toArray() {
        return [this.no, this.group, this.type, this.dim, this.elemPrm, this.elemSlv, this.val1, this.val2, this.val3]
    }
}
class ElemForce {
    constructor([no, group, type, dim, elemPrm, elemSlv, val]) {
        this.no = no
        this.group = group
        this.type = type
        this.dim = dim
        this.elemPrm = elemPrm
        this.elemSlv = elemSlv
        this.val = val
    }
    toArray() {
        return [this.no, this.group, this.type, this.dim, this.elemPrm, this.elemSlv, this.val]
    }
}

const useModelStore = defineStore('model', {
    state: () => {
        return {
            info: {
                version: '',
                uuid: '',
            },
            node: [],
            elem: [],
            facet: [],
            cnst: [],
            targetGroup: [{ no: 1, label: 'basis' },],
            nodeShape: [],
            elemShape: [],
            elemForce: [],
            result: [],
        }
    },
    getters: {
        nodeSize: (state) => state.node.length,
        elemSize: (state) => state.elem.length,
        cnstSize: (state) => state.cnst.length,
        nodeShapeSize: (state) => state.nodeShape.length,
        elemShapeSize: (state) => state.elemShape.length,
        elemForceSize: (state) => state.elemForce.length,

        elemType: (state) => Array.from(new Set(state.elem.map(elem => elem.type))).sort(sortNumber),
        elemFemType: (state) => Array.from(new Set(state.elem.map(elem => elem.femType))).sort(sortNumber),
        elemMat: (state) => Array.from(new Set(state.elem.map(elem => elem.mat))).sort(sortNumber),
        elemSec: (state) => Array.from(new Set(state.elem.map(elem => elem.sec))).sort(sortNumber),
        cnstType: (state) => Array.from(new Set(state.cnst.map(cnst => cnst.type))).sort(sortNumber),
        nodeShapeType: (state) => Array.from(new Set(state.nodeShape.map(shape => parseInt(shape.type / 16)))).sort(sortNumber),
        elemShapeType: (state) => Array.from(new Set(state.elemShape.map(shape => parseInt(shape.type / 16)))).sort(sortNumber),
        elemForceType: (state) => Array.from(new Set(state.elemShape.map(force => parseInt(force.type / 16)))).sort(sortNumber),

        summarized: (state) => {
            const nodeType = [{ no: 0, label: 'lock', size: 0 }, { no: 1, label: 'free', size: 0 }]
            const freeNode = new Set(
                state.elem.filter(elem => elem.type == 1).map(elem => [elem.iNode, elem.jNode]).flat()
            )
            const lockNode = SetOperation(new Set(state.node.map(node => node.no)), freeNode, 'delete')
            nodeType.map(item => {
                if (item.no == 0) {
                    item.size = lockNode.size
                }
                else {
                    item.size = freeNode.size
                }
            })

            const elemType = [{ no: 0, label: 'lock', size: 0 }, { no: 1, label: 'free', size: 0 }]
            const freeElem = new Set(
                state.elem.filter(elem => elem.type == 1).map(elem => elem.no)
            )
            const lockElem = SetOperation(new Set(state.elem.map(elem => elem.no)), freeElem, 'delete')
            elemType.map(item => {
                if (item.no == 0) {
                    item.size = lockElem.size
                }
                else {
                    item.size = freeElem.size
                }
            })

            const elemFemType = Array.from(new Set(state.elem.map(elem => elem.femType))).sort(sortNumber)
            const elemMat = Array.from(new Set(state.elem.map(elem => elem.mat))).sort(sortNumber)
            const elemSec = Array.from(new Set(state.elem.map(elem => elem.sec))).sort(sortNumber)

            const femType = elemFemType.map(item => {
                return { no: item, label: item, size: 0 }
            })
            const mat = elemMat.map(item => {
                return { no: item, label: item, size: 0 }
            })
            const sec = elemSec.map(item => {
                return { no: item, label: item, size: 0 }
            })

            femType.map(femType => {
                femType.size = state.elem.filter(elem => elem.femType === femType.no).length
            })
            mat.map(mat => {
                mat.size = state.elem.filter(elem => elem.mat === mat.no).length
            })
            sec.map(sec => {
                sec.size = state.elem.filter(elem => elem.sec === sec.no).length
            })

            //cnst.size表示每种约束类型的节点数，不是定义的约束数目。
            const cnst = state.cnstType.map(type => {
                return { type, label: type, size: 0 }
            })
            cnst.map(cnst => {
                //防止有重复的约束
                const cnstNode = new Set(state.cnst.filter(i => i.type === cnst.type).map(j => j.node))
                cnst.size = cnstNode.size
            })
            //nodeShape
            const nodeShapeType = state.nodeShapeType
            const nodeShape = state.targetGroup.map(group => {
                let nodeShape = nodeShapeType.map((type) =>
                    state.nodeShape.filter(i => parseInt(i.type / 16) == type && i.group == group.no)
                )

                let labels = nodeShapeType.map(type =>
                    TARGETTYPE.find(i => i.no == type).label
                )

                return {
                    no: group.no,
                    label: group.label,
                    type: nodeShape.map((shape, i) => {
                        return {
                            no: nodeShapeType[i],
                            label: labels[i],
                            size: shape.length,
                        }
                    }),
                }
            })
            //elemShape
            const elemShapeType = state.elemShapeType
            const elemShape = state.targetGroup.map(group => {
                let elemShape = elemShapeType.map((type) =>
                    state.elemShape.filter(i => parseInt(i.type / 16) == type && i.group == group.no)
                )
                let labels = elemShapeType.map(type =>
                    TARGETTYPE.find(i => i.no == type).label
                )
                return {
                    no: group.no,
                    label: group.label,
                    type: elemShape.map((shape, i) => {
                        return {
                            no: elemShapeType[i],
                            label: labels[i],
                            size: shape.length,
                        }
                    }),
                }
            })
            //elemForce
            const elemForceType = state.elemForceType
            const elemForce = state.targetGroup.map(group => {
                let elemForce = elemForceType.map((type) =>
                    state.elemForce.filter(i => parseInt(i.type / 16) == type && i.group == group.no)
                )
                let labels = elemForceType.map(type =>
                    TARGETTYPE.find(i => i.no == type).label
                )
                return {
                    no: group.no,
                    label: group.label,
                    type: elemForce.map((shape, i) => {
                        return {
                            no: elemForceType[i],
                            label: labels[i],
                            size: shape.length,
                        }
                    }),
                }
            })
            return {
                node: nodeType,
                elem: {
                    type: elemType,
                    femType: femType,
                    mat: mat,
                    sec: sec,
                },
                cnst: cnst,
                nodeShape,
                elemShape,
                elemForce,
            }
        },
        categorized: (state) => {
            const freeNode = new Set(
                state.elem.filter(elem => elem.type == 1).map(elem => [elem.iNode, elem.jNode]).flat()
            )
            const freeElem = new Set(
                state.elem.filter(elem => elem.type == 1).map(elem => elem.no)
            )
            const femType = new Map()
            const mat = new Map()
            const sec = new Map()
            state.elemFemType.forEach(no => femType.set(no, new Set(state.elem.filter(elem => elem.femType == no).map(elem => elem.no))))
            state.elemMat.forEach(no => mat.set(no, new Set(state.elem.filter(elem => elem.mat == no).map(elem => elem.no))))
            state.elemSec.forEach(no => sec.set(no, new Set(state.elem.filter(elem => elem.sec == no).map(elem => elem.no))))
            //cnst
            const cnst = state.cnstType.map(type => {
                return {
                    type,
                    node: state.cnst.filter(cnst => cnst.type == type).map(cnst => cnst.node)
                }
            })
            //nodeShape
            const nodeShape = state.targetGroup.map(group => state.nodeShapeType.map(type => {
                const set = new Set(
                    state.nodeShape.filter(shape => parseInt(shape.type / 16) == type && shape.group == group.no)
                        .map(shape => [shape.nodePrm, shape.nodeSlv]).flat()
                )
                set.delete(0)
                return {
                    group: group.no,
                    type,
                    node: set
                }
            })).flat()
            //elemShape
            const elemShape = state.targetGroup.map(group => state.elemShapeType.map(type => {
                const set = new Set(
                    state.elemShape.filter(shape => parseInt(shape.type / 16) == type && shape.group == group.no)
                        .map(shape => [shape.elemPrm, shape.elemSlv]).flat()
                )
                set.delete(0)
                return {
                    group: group.no,
                    type,
                    elem: set
                }
            })).flat()
            //elemForce
            const elemForce = state.targetGroup.map(group => state.elemForceType.map(type => {
                const set = new Set(
                    state.elemForce.filter(force => parseInt(force.type / 16) == type && force.group == group.no)
                        .map(force => [force.elemPrm, force.elemSlv]).flat()
                )
                set.delete(0)
                return {
                    group: group.no,
                    type,
                    elem: set
                }
            })).flat()
            //
            return {
                node: {
                    all: new Set(state.node.map(node => node.no)),
                    free: freeNode,
                    lock: SetOperation(new Set(state.node.map(node => node.no)), freeNode, 'delete'),
                },
                elem: {
                    all: new Set(state.elem.map(elem => elem.no)),
                    free: freeElem,
                    lock: SetOperation(new Set(state.elem.map(elem => elem.no)), freeElem, 'delete'),
                    femType,
                    mat,
                    sec,
                },
                cnst: cnst,
                nodeShape: nodeShape,
                elemShape: elemShape,
                elemForce: elemForce,
            }
        },

    },
    actions: {
        insertNode(no, arr) {
            this.node.push(new Node([no, ...arr]))
        },
        insertElem(no, arr) {
            this.elem.push(new Elem([no, ...arr]))
        },
        insertCnst(no, arr) {
            this.cnst.push(new Cnst([no, ...arr]))
        },
        insertNodeShape(no, arr) {
            this.nodeShape.push(new NodeShape([no, ...arr]))
        },
        insertElemShape(no, arr) {
            this.elemShape.push(new ElemShape([no, ...arr]))
        },
        insertElemForce(no, arr) {
            this.elemForce.push(new ElemForce([no, ...arr]))
        },
        boundingInfo() {
            if (this.node.length == 0) {
                return {
                    xMin: 0, xMax: 0,
                    yMin: 0, yMax: 0,
                    zMin: 0, zMax: 0,
                }
            }
            else {
                let i = 0
                let iNode = this.node[i]
                let bdg = {
                    xMin: iNode.x, xMax: iNode.x,
                    yMin: iNode.y, yMax: iNode.y,
                    zMin: iNode.z, zMax: iNode.z,
                }
                for (i = 1; i < this.node.length; i++) {
                    iNode = this.node[i]
                    if (bdg.xMin > iNode.x) bdg.xMin = iNode.x
                    if (bdg.xMax < iNode.x) bdg.xMax = iNode.x
                    if (bdg.yMin > iNode.y) bdg.yMin = iNode.y
                    if (bdg.yMax < iNode.y) bdg.yMax = iNode.y
                    if (bdg.zMin > iNode.z) bdg.zMin = iNode.z
                    if (bdg.zMax < iNode.z) bdg.zMax = iNode.z
                }
                return bdg
            }
        },
        clearResult() {
            this.result = []
        },
        filter({ mesh, from, label = 0, group = 0, type = 0 }) {
            switch (mesh) {
                case 'node':
                    switch (from) {
                        case 'type': {
                            switch (label) {
                                case 'free':
                                    return this.categorized.node.free
                                case 'lock':
                                    return this.categorized.node.lock
                                default:
                                    return new Set()
                            }
                        }
                        case 'cnst': {
                            return this.categorized.cnst.find(cnst => cnst.type == type)
                                .node
                        }
                        case 'nodeShape': {
                            return this.categorized.nodeShape.find(shape => shape.group == group && shape.type == type)
                                .node
                        }
                        default:
                            return new Set()
                    }
                case 'elem':
                    switch (from) {
                        case 'type':
                            switch (label) {
                                case 'free':
                                    return this.categorized.elem.free
                                case 'lock':
                                    return this.categorized.elem.lock
                                default:
                                    return new Set()
                            }
                        case 'femType':
                            return this.categorized.elem[from].get(label)
                        case 'mat':
                            return this.categorized.elem[from].get(label)
                        case 'sec':
                            return this.categorized.elem[from].get(label)
                        case 'elemShape':
                            return this.categorized.elemShape.find(shape => shape.group == group && shape.type == type)
                                .elem
                        case 'elemForce':
                            return this.categorized.elemForce.find(force => force.group == group && force.type == type)
                                .elem
                        default:
                            return new Set()
                    }
                default:
                    return new Set()
            }
        }
    },
})

export { TARGETTYPE, Node, Elem, useModelStore }
