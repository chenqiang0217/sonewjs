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
    toArray() {
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
        const arr = this.toArray()
        arr.splice(-2, 2, this.iNode.clone(), this.jNode.clone())
        return new BaseElem(arr)
    }
}
class Elem extends BaseElem {
    static TYPE = {
        FREE: 0b00000000,
        LOCK: 0b00000001
    }
    constructor([no, type, femType, mat, sec, iNode, jNode]) {
        super([no, femType, mat, sec, iNode, jNode])
        this.type = type
    }
    toArray() {
        return [
            this.no,
            this.type,
            this.femType,
            this.mat,
            this.sec,
            this.iNode.no,
            this.jNode.no
        ]
    }
    toArrayShort() {
        return [
            this.no,
            this.iNode.no,
            this.jNode.no
        ]
    }
    clone() {
        const arr = this.toArray()
        arr.splice(-2, 2, this.iNode.clone(), this.jNode.clone())
        return new Elem(arr)
    }
}

export { BaseElem, Elem }
