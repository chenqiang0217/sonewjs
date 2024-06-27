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
        SNODE: 0b00000000,
        TNODEDIFF: 0b00000001,
        TNODEDIVD: 0b00000010
    }
    constructor([no, group, equality, type, dim, nodePrm, nodeSlv, x, y, z]) {
        super([no, group, equality, type, dim])
        this.nodePrm = nodePrm
        this.nodeSlv = nodeSlv
        this.x = x
        this.y = y
        this.z = z
    }
    asArray() {
        return [
            this.no,
            this.group.no,
            this.equality,
            this.type,
            this.dim,
            this.nodePrm instanceof Node ? this.nodePrm.no : 0,
            this.nodeSlv instanceof Node ? this.nodeSlv.no : 0,
            this.x,
            this.y,
            this.z
        ]
    }
}
class ElemShape extends Target {
    static TYPE = {SELEM: 0b00000000, SELEML: 0b00000001, TELEMDIVD: 0b00000010}
    constructor([no, group, equality, type, dim, elemPrm, elemSlv, x, y, z]) {
        super([no, group, equality, type, dim])
        this.elemPrm = elemPrm
        this.elemSlv = elemSlv
        this.x = x
        this.y = y
        this.z = z
    }
    asArray() {
        return [
            this.no,
            this.group.no,
            this.equality,
            this.type,
            this.dim,
            this.elemPrm instanceof Elem ? this.elemPrm.no : 0,
            this.elemSlv instanceof Elem ? this.elemSlv.no : 0,
            this.x,
            this.y,
            this.z
        ]
    }
}
class ElemForce extends Target {
    static TYPE = {
        SDENSITY: 0b00000000,
        TDENSITYDIFF: 0b00000001,
        TDENSITYDIVD: 0b00000010,
        SFORCE1: 0b00000011,
        TFORCEDIVD1: 0b00000100,
        SFORCE2: 0b00001011,
        TFORCEDIVD2: 0b00001100
    }
    constructor([no, group, equality, type, dim, elemPrm, elemSlv, val]) {
        super([no, group, equality, type, dim])
        this.elemPrm = elemPrm
        this.elemSlv = elemSlv
        this.val = val
    }
    asArray() {
        return [
            this.no,
            this.group.no,
            this.equality,
            this.type,
            this.dim,
            this.elemPrm instanceof Elem ? this.elemPrm.no : 0,
            this.elemSlv instanceof Elem ? this.elemSlv.no : 0,
            this.val
        ]
    }
}

export {Target, NodeShape, ElemShape, ElemForce}
