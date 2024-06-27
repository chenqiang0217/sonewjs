import {Vector3} from '@babylonjs/core'
class Cs {
    constructor({
        no,
        origin = Vector3.Zero(),
        orientation = Vector3.One(),
        label = '',
        description = ''
    }) {
        this.no = no
        this.origin = origin
        this.orientation = orientation
        this.label = label
        this.description = description
    }
}

export {Cs}
