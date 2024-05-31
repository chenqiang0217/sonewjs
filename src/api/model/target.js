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
    constructor([no, group, equality, type, dim, nodePrm, nodeSlv, x, y, z]) {
        super([no, group, equality, type, dim])
        this.nodePrm = nodePrm
        this.nodeSlv = nodeSlv
        this.x = x
        this.y = y
        this.z = z
    }
    toArray() {
        return [
            this.no,
            this.group,
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
    constructor([
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
    ]) {
        super([no, group, equality, type, dim])
        this.elemPrm = elemPrm
        this.elemSlv = elemSlv
        this.val1 = val1
        this.val2 = val2
        this.val3 = val3
    }
    toArray() {
        return [
            this.no,
            this.group,
            this.equality,
            this.type,
            this.dim,
            this.elemPrm instanceof Elem ? this.elemPrm.no : 0,
            this.elemSlv instanceof Elem ? this.elemSlv.no : 0,
            this.val1,
            this.val2,
            this.val3
        ]
    }
}
class ElemForce extends Target {
    constructor([no, group, equality, type, dim, elemPrm, elemSlv, val]) {
        super([no, group, equality, type, dim])
        this.elemPrm = elemPrm
        this.elemSlv = elemSlv
        this.val = val
    }
    toArray() {
        return [
            this.no,
            this.group,
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
