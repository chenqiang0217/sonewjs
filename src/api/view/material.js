import {StandardMaterial} from '@babylonjs/core'
import {useViewConfigStore} from './config'

class Material {
    constructor(scene) {
        const config = useViewConfigStore()
        this.point = {
            selected: new StandardMaterial('pointeMatSelected', scene),

            lock: new StandardMaterial('pointeMatPrepLock', scene),
            free: new StandardMaterial('pointeMatPrepFree', scene)
        }
        this.point.selected.emissiveColor = config.mesh.node.color.selected
        this.point.lock.emissiveColor = config.mesh.node.color.lock
        this.point.free.emissiveColor = config.mesh.node.color.free
    }
}

export {Material}
