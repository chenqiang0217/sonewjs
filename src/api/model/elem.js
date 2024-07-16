import {Color3} from '@babylonjs/core'

class ElemAttr {
    constructor(no, label, color) {
        this.no = no
        this.label = label
        this.color = color
    }
}
class ElemType{
    static FREE = new ElemAttr(0b00000000, 'free', Color3.Black())
    static LOCK = new ElemAttr(0b00000001, 'lock', Color3.Gray())
}
class ElemFemType extends ElemAttr{
    constructor(no, label, color) {
        super(no, label, color)
    }
}
class ElemMat extends ElemAttr{
    constructor(no, label, color) {
        super(no, label, color)
    }
}
class ElemSec extends ElemAttr{
    constructor(no, label, color) {
        super(no, label, color)
    }
}
class BaseElem {
    constructor([no, femType, mat, sec, iNode, jNode]) {
        this.no = no
        this.femType = femType
        this.mat = mat
        this.sec = sec
        this.iNode = iNode
        this.jNode = jNode
    }
    get length() {
        return this.jNode.position.subtract(this.iNode.position).length()
    }
    asArray() {
        return [
            this.no,
            this.femType.no,
            this.mat.no,
            this.sec.no,
            this.iNode.no,
            this.jNode.no
        ]
    }
    clone() {
        return new Elem([
            this.no,
            this.femType,
            this.mat,
            this.sec,
            this.iNode.clone(),
            this.jNode.clone()
        ])
    }
}
class Elem extends BaseElem {
    constructor([no, eType, femType, mat, sec, iNode, jNode]) {
        super([no, femType, mat, sec, iNode, jNode])
        this.eType = eType
    }
    asArray() {
        return [
            this.no,
            this.eType.no,
            this.femType.no,
            this.mat.no,
            this.sec.no,
            this.iNode.no,
            this.jNode.no
        ]
    }
    asArrayShort() {
        return [
            this.no,
            this.iNode.no,
            this.jNode.no
        ]
    }
    clone() {
        return new Elem([
            this.no,
            this.eType,
            this.femType,
            this.mat,
            this.sec,
            this.iNode.clone(),
            this.jNode.clone()
        ])
    }
}




export { BaseElem, Elem, ElemType, ElemFemType, ElemMat, ElemSec }
