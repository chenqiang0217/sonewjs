import { markRaw } from 'vue'
import {defineStore} from 'pinia'
import {Color3} from '@babylonjs/core'
import {byNumAsec, byNoAsec} from '../api/utils'
import {
    Node,
    Elem,
    ElemType,
    ElemFemType,
    ElemMat,
    ElemSec,
    Cnst,
    NodeShape,
    ElemShape,
    ElemForce,
    LoadGroup,
    TargetGroup,
    LoadStep,
    Cs
} from '../api/model/index'
import {useView} from '../api/view/index'

const useModelStore = defineStore('model', {
    state: () => {
        return {
            node: [],
            elem: [],
            facet: [],
            elemType: [ElemType.FREE, ElemType.LOCK],
            elemFemType: [],
            elemMat: [],
            elemSec: [],
            cnst: [],
            target: {
                group: [],
                nodeShape: [],
                elemShape: [],
                elemForce: []
            },
            load: {
                group: [],
                node: {},
                elem: {}
            },
            cs: markRaw([new Cs({no: 0, label: '世界坐标系'})]),
            loadStep: [],
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
                elem => elem.eType === state.elemType[0]
            ).sort(byNoAsec)
            const freeNode = freeElem
                .map(elem => [elem.iNode, elem.jNode])
                .flat()
                .filter((item, index, arr) => arr.indexOf(item) === index)
                .sort(byNoAsec)
            const femType = state.elem
                .map(elem => elem.femType)
                .filter((item, index, arr) => arr.indexOf(item) === index)
                .sort(byNoAsec)
                .map(item => ({
                    key: item,
                    elem: state.elem.filter(elem => elem.femType === item)
                }))
            const mat = state.elem
                .map(elem => elem.mat)
                .filter((item, index, arr) => arr.indexOf(item) === index)
                .sort(byNoAsec)
                .map(item => ({
                    key: item,
                    elem: state.elem.filter(elem => elem.mat === item)
                }))
            const sec = state.elem
                .map(elem => elem.sec)
                .filter((item, index, arr) => arr.indexOf(item) === index)
                .sort(byNoAsec)
                .map(item => ({
                    key: item,
                    elem: state.elem.filter(elem => elem.sec === item)
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
                    const point = 
                    view.points.prep.find(point => point.mesh.metadata === receiver)
                    point.mesh.position = receiver.positionInScene
                    point.updateLabelText()
                    view.lines.prep
                        .filter(
                            line =>
                                line.mesh.metadata.iNode === receiver ||
                                line.mesh.metadata.jNode === receiver
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
            const index = this.node.findIndex(item => item.no === node.no)
            const view = useView()
            //必须保证两数组数据一致
            if (index != -1) {
                view.points.prep[index].dispose()
                view.points.prep.splice(index, 1)
                this.node.splice(index, 1)
            }
        },
        createElemFemType(no, label, color = Color3.Black()) {
            const elemFemType = new ElemFemType(no, label, color)
            this.elemFemType.push(elemFemType)
            return elemFemType
        },
        removeElemFemType(elemFemType) {
            const index = this.elemFemType.findIndex(item => item.no === elemFemType.no)
            if (index != -1) {
                this.elemFemType.splice(index, 1)
            }
        },
        createElemMat(no, label, color = Color3.Black()) {
            const elemMat = new ElemMat(no, label, color)
            this.elemMat.push(elemMat)
            return elemMat
        },
        removeElemMat(elemMat) {
            const index = this.elemMat.findIndex(item => item.no === elemMat.no)
            if (index != -1) {
                this.elemMat.splice(index, 1)
            }
        },
        createElemSec(no, label, color = Color3.Black()) {
            const elemSec = new ElemSec(no, label, color)
            this.elemSec.push(elemSec)
            return elemSec
        },
        removeElemSec(elemSec) {
            const index = this.elemSec.findIndex(item => item.no === elemSec.no)
            if (index != -1) {
                this.elemSec.splice(index, 1)
            }
        },
        createElem([no, typeNo, femTypeNo, matNo, secNo, iNodeNo, jNodeNo]) {
            const iNode = this.node.find(node => node.no === iNodeNo)
            const jNode = this.node.find(node => node.no === jNodeNo)
            const type = this.elemType.find(item => item.no === typeNo)
            const femType = this.elemFemType.find(item => item.no === femTypeNo)
            const mat = this.elemMat.find(item => item.no === matNo)
            const sec = this.elemSec.find(item => item.no === secNo)
            if (iNode && jNode && type && femType && mat && sec) {
                const elem = new Proxy(
                    new Elem([no, type, femType, mat, sec, iNode, jNode]),
                    {
                        set: function (obj, prop, value, receiver) {
                            Reflect.set(obj, prop, value)
                            const view = useView()
                            view.lines.prep
                                .find(l => l.mesh.metadata === receiver)
                                .update()
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
            const index = this.elem.findIndex(item => item.no === elem.no)
            const view = useView()
            //必须保证两数组数据一致
            if (index != -1) {
                view.lines.prep[index].dispose()
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
            const index = this.cnst.findIndex(item => item.no === cnst.no)
            if (index != -1) {
                this.cnst.splice(index, 1)
            }
        },
        createNodeShape([
            no,
            groupNo,
            equality,
            typeValue,
            dim,
            nodeNoSlv,
            nodeNoPrm,
            x,
            y,
            z
        ]) {
            const group = this.target.group.find(group => group.no === groupNo)
            const type = Object.values(NodeShape.TYPE).find(
                type => type.is === typeValue
            )
            const nodeSlv = this.node.find(node => node.no === nodeNoSlv)
            const nodePrm = this.node.find(node => node.no === nodeNoPrm)
            const nodeShape = new Proxy(
                new NodeShape([
                    no,
                    group,
                    equality,
                    type,
                    dim,
                    nodeSlv,
                    nodePrm,
                    x,
                    y,
                    z
                ]),
                {
                    set: function (obj, prop, value, receiver) {
                        const view = useView()
                        let point = view.points.prep.find(point =>
                            point.textBlock.target.nodeShape
                                .map(textBlock => textBlock.metadata)
                                .flat()
                                .includes(receiver)
                        )
                        point.removeNodeShape(receiver)
                        Reflect.set(obj, prop, value)
                        if (prop == 'nodeSlv') {
                            point = view.points.prep.find(
                                point => point.mesh.metadata === receiver[prop]
                            )
                        }
                        point.createNodeShape(receiver)
                        return true
                    }
                }
            )
            const view = useView()
            const point = view.points.prep.find(
                point => point.mesh.metadata === nodeSlv
            )
            this.target.nodeShape.push(nodeShape)
            point.createNodeShape(this.target.nodeShape.at(-1))
            return this.target.nodeShape.at(-1)
        },
        removeNodeShape(target) {
            const index = this.target.nodeShape.findIndex(
                item => item.no === target.no
            )
            const view = useView()
            const point = view.points.prep.find(
                point => point.mesh.metadata === target.nodeSlv
            )
            if (index != -1) {
                point.removeNodeShape(target)
                this.target.nodeShape.splice(index, 1)
            }
        },
        createElemShape([
            no,
            groupNo,
            equality,
            typeValue,
            dim,
            elemNoSlv,
            elemNoPrm,
            x,
            y,
            z
        ]) {
            const group = this.target.group.find(group => group.no === groupNo)
            const type = Object.values(ElemShape.TYPE).find(
                type => type.is === typeValue
            )
            const elemSlv = this.elem.find(elem => elem.no === elemNoSlv)
            const elemPrm = this.elem.find(elem => elem.no === elemNoPrm)
            const elemShape = new Proxy(
                new ElemShape([
                    no,
                    group,
                    equality,
                    type,
                    dim,
                    elemSlv,
                    elemPrm,
                    x,
                    y,
                    z
                ]),
                {
                    set: function (obj, prop, value, receiver) {
                        const view = useView()
                        let line = view.lines.prep.find(line =>
                            line.textBlock.target.elemShape
                                .map(textBlock => textBlock.metadata)
                                .flat()
                                .includes(receiver)
                        )
                        line.removeTarget(receiver)
                        Reflect.set(obj, prop, value)
                        if (prop == 'elemSlv') {
                            line = view.lines.prep.find(
                                line => line.mesh.metadata === receiver[prop]
                            )
                        }
                        line.createTarget(receiver)
                        line.alignText()
                        return true
                    }
                }
            )
            const view = useView()
            const line = view.lines.prep.find(
                line => line.mesh.metadata === elemSlv
            )
            this.target.elemShape.push(elemShape)
            line.createTarget(this.target.elemShape.at(-1))
            return this.target.elemShape.at(-1)
        },
        removeElemShape(target) {
            const index = this.target.elemShape.findIndex(
                item => item.no === target.no
            )
            const view = useView()
            const line = view.lines.prep.find(
                line => line.mesh.metadata === target.elemSlv
            )
            if (index != -1) {
                line.removeTarget(target)
                this.target.elemShape.splice(index, 1)
            }
        },
        createElemForce([
            no,
            groupNo,
            equality,
            typeValue,
            dim,
            elemNoSlv,
            elemNoPrm,
            val
        ]) {
            const group = this.target.group.find(group => group.no === groupNo)
            const type = Object.values(ElemForce.TYPE).find(
                type => type.is === typeValue
            )
            const elemSlv = this.elem.find(elem => elem.no === elemNoSlv)
            const elemPrm = this.elem.find(elem => elem.no === elemNoPrm)
            const elemForce = new Proxy(
                new ElemForce([
                    no,
                    group,
                    equality,
                    type,
                    dim,
                    elemSlv,
                    elemPrm,
                    val
                ]),
                {
                    set: function (obj, prop, value, receiver) {
                        const view = useView()
                        let line = view.lines.prep.find(line =>
                            line.textBlock.target.elemForce
                                .map(textBlock => textBlock.metadata)
                                .flat()
                                .includes(receiver)
                        )
                        line.removeTarget(receiver)
                        Reflect.set(obj, prop, value)
                        if (prop == 'elemSlv') {
                            line = view.lines.prep.find(
                                line => line.mesh.metadata === receiver[prop]
                            )
                        }
                        line.createTarget(receiver)
                        return true
                    }
                }
            )
            const view = useView()
            const line = view.lines.prep.find(
                line => line.mesh.metadata === elemSlv
            )
            this.target.elemForce.push(elemForce)
            line.createTarget(this.target.elemForce.at(-1))
            return this.target.elemForce.at(-1)
        },
        removeElemForce(target) {
            const index = this.target.elemForce.findIndex(
                item => item.no === target.no
            )
            const view = useView()
            const line = view.lines.prep.find(
                line => line.mesh.metadata === target.elemSlv
            )
            if (index != -1) {
                line.removeTarget(target)
                this.target.elemForce.splice(index, 1)
            }
        },
        createTargetGroup(no, label, description) {
            this.target.group.push(new TargetGroup(no, label, description))
        },
        removeTargetGroup(group) {
            const index = this.target.group.findIndex(item => item.no === group.no)
            if (index != -1) {
                this.target.group.splice(index, 1)
            }
        },
        createLoadStep(label, targetGroupNo = [], subStep, description) {
            const targetGroup = targetGroupNo.map(
                no => this.target.group.find(group => group.no == no)
            ).filter(group => group)
            this.loadStep.push(
                new LoadStep(label, targetGroup, subStep, description)
            )
        },
        removeLoadStep(loadStep) {
            const index = this.loadStep.findIndex(item => item.no === loadStep.no)
            if (index != -1) {
                this.loadStep.splice(index, 1)
            }
        },
        clearResult() {
            this.result = []
        }
    }
})

export {useModelStore}
