import {Vector3} from '@babylonjs/core'

class Node {
    static NTYPE = {
        FREE: 0b00000000,
        LOCK: 0b00000001
    }
    constructor([no, x, y, z]) {
        this.no = no
        this.x = x
        this.y = y
        this.z = z
    }
    get position() {
        return new Vector3(this.x, this.y, this.z)
    }
    set position({x, y, z}) {
        this.x = x
        this.y = y
        this.z = z
    }
    get positionInScene() {
        return new Vector3(this.y, this.z, this.x)
    }
    asArray() {
        return [this.no, this.x, this.y, this.z]
    }
    clone() {
        return new Node(this.asArray())
    }
}
export {Node}
