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
            this.femType,
            this.mat,
            this.sec,
            this.iNode.no,
            this.jNode.no
        ]
    }
    clone() {
        const arr = this.asArray()
        arr.splice(-2, 2, this.iNode.clone(), this.jNode.clone())
        return new BaseElem(arr)
    }
}
class Elem extends BaseElem {
    static ETYPE = {
        FREE: 0b00000000,
        LOCK: 0b00000001
    }
    constructor([no, eType, femType, mat, sec, iNode, jNode]) {
        super([no, femType, mat, sec, iNode, jNode])
        this.eType = eType
    }
    asArray() {
        return [
            this.no,
            this.eType,
            this.femType,
            this.mat,
            this.sec,
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
        const arr = this.asArray()
        arr.splice(-2, 2, this.iNode.clone(), this.jNode.clone())
        return new Elem(arr)
    }
}

export { BaseElem, Elem }
