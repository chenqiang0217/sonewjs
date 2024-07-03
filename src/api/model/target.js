import {Node} from './node'
import {Elem} from './elem'

class Target {
    static EQUALITY = {EQ: 0b00000000, GT: 0b00000001, LT: 0b00000010}
    constructor([no, group, equality, type, dim]) {
        this.no = no
        this.group = group
        this.equality = equality
        this.type = type
        this.dim = dim
    }
}
class NodeShape extends Target {
    static TYPE = {
        SNODE: {
            is: 0b00000000,
            label: '单节点',
            alias: '①'
        },
        TNODEDIFF: {
            is: 0b00000001,
            label: '两节点差值',
            alias: '②'
        },
        TNODEDIVD: {
            is: 0b00000010,
            label: '两节点比值',
            alias: '③'
        }
    }
    constructor([no, group, equality, type, dim, nodeSlv, nodePrm, x, y, z]) {
        super([no, group, equality, type, dim])
        this.nodeSlv = nodeSlv
        this.nodePrm = nodePrm
        this.x = x
        this.y = y
        this.z = z
    }
    asArray() {
        return [
            this.no,
            this.group.no,
            this.equality,
            this.type.is,
            this.dim,
            this.nodeSlv instanceof Node ? this.nodeSlv.no : 0,
            this.nodePrm instanceof Node ? this.nodePrm.no : 0,
            this.x,
            this.y,
            this.z
        ]
    }
}
class ElemShape extends Target {
    static TYPE = {
        SELEM: {
            is: 0b00000000,
            label: '节点坐标差值',
            alias: '①'
        },
        SELEML: {
            is: 0b00000001,
            label: '投影长度',
            alias: '②'
        },
        TELEMDIVD: {
            is: 0b00000010,
            label: '投影长度比值',
            alias: '③'
        }
    }
    constructor([no, group, equality, type, dim, elemSlv, elemPrm, x, y, z]) {
        super([no, group, equality, type, dim])
        this.elemSlv = elemSlv
        this.elemPrm = elemPrm
        this.x = x
        this.y = y
        this.z = z
    }
    asArray() {
        return [
            this.no,
            this.group.no,
            this.equality,
            this.type.is,
            this.dim,
            this.elemSlv instanceof Elem ? this.elemSlv.no : 0,
            this.elemPrm instanceof Elem ? this.elemPrm.no : 0,
            this.x,
            this.y,
            this.z
        ]
    }
}
class ElemForce extends Target {
    static TYPE = {
        SDENSITY: {
            is: 0b00000000,
            label: '力密度',
            alias: '①'
        },
        TDENSITYDIFF: {
            is: 0b00000001,
            label: '力密度差值',
            alias: '②'
        },
        TDENSITYDIVD: {
            is: 0b00000010,
            label: '力密度比值',
            alias: '③'
        },
        SFORCE1: {
            is: 0b00000011,
            label: '单元力，以力密度为未知数',
            alias: '④'
        },
        TFORCEDIVD1: {
            is: 0b00000100,
            label: '单元力比值，以力密度为未知数',
            alias: '⑤'
        },
        SFORCE2: {
            is: 0b00001011,
            label: '单元力，以节点坐标为未知数',
            alias: '⑥'
        },
        TFORCEDIVD2: {
            is: 0b00001100,
            label: '单元力比值，以节点坐标为未知数',
            alias: '⑦'
        }
    }
    constructor([no, group, equality, type, dim, elemSlv, elemPrm, val]) {
        super([no, group, equality, type, dim])
        this.elemSlv = elemSlv
        this.elemPrm = elemPrm
        this.val = val
    }
    asArray() {
        return [
            this.no,
            this.group.no,
            this.equality,
            this.type.is,
            this.dim,
            this.elemSlv instanceof Elem ? this.elemSlv.no : 0,
            this.elemPrm instanceof Elem ? this.elemPrm.no : 0,
            this.val
        ]
    }
}

export {Target, NodeShape, ElemShape, ElemForce}
