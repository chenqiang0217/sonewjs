import {
    StandardMaterial
} from "@babylonjs/core"
import { useViewConfigStore } from './config'

class Material{
    constructor(scene){
        const config = useViewConfigStore()
        this.point = {
            selected: new StandardMaterial('pointeMatSelected', scene),
            prep: {
                lock: new StandardMaterial('pointeMatPrepLock', scene),
                free: new StandardMaterial('pointeMatPrepFree', scene),
            },
            rslt: {
                lock: new StandardMaterial('pointeMatRsltLock', scene),
                free: new StandardMaterial('pointeMatRsltFree', scene),
            },
        }
        this.point.selected.emissiveColor = config.mesh.node.color.selected
        this.point.prep.lock.emissiveColor = config.mesh.node.color.prep.lock
        this.point.prep.free.emissiveColor = config.mesh.node.color.prep.free
        this.point.rslt.lock.emissiveColor = config.mesh.node.color.rslt.lock
        this.point.rslt.free.emissiveColor = config.mesh.node.color.rslt.free
    }
}

export {Material}