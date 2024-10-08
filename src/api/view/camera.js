import {
    ArcRotateCamera,
    Vector2,
    Vector3,
    GreasedLineMesh
} from '@babylonjs/core'
import { useViewConfigStore } from './config'

class OrthoCamera extends ArcRotateCamera {
    constructor(
        scene,
        alpha = Math.PI,
        beta = 0,
        radius = 1,
        target = Vector3.Zero()
    ) {
        super('camera', alpha, beta, radius, target, scene)
        this.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA
        this.panningSensibility = 100
        this.inertia = 0.0
        this.radiusStatic = this.radius
    }
    get meshWidth() {
        const config = useViewConfigStore()
        const width = this.orthoRight - this.orthoLeft
        const scene = this.getScene()
        const engine = scene.getEngine()
        const canvas = engine.getRenderingCanvas()
        return {
            point: (config.mesh.node.widthPx * width) / canvas.width,
            line: (config.mesh.elem.widthPx * width) / canvas.width
        }
    }
    setView({ direction, bounding } = {}) {
        let bdg3, bdg2
        if (direction && bounding) {
            bdg3 = bounding.max.subtract(bounding.min)
            const target = Vector3.Center(bounding.min, bounding.max)
            this.target = new Vector3(target.y, target.z, target.x)
            this.radiusStatic = bdg3.length() == 0 ? 4.0 : bdg3.length() * 4.0
            this.radius = this.radiusStatic
            switch (direction) {
                case 'x':
                    this.alpha = Math.PI * 0.5
                    this.beta = Math.PI * 0.5
                    bdg2 = new Vector2(bdg3.y, bdg3.z)
                    break
                case 'y':
                    this.alpha = Math.PI * 1.0
                    this.beta = Math.PI * 0.5
                    bdg2 = new Vector2(bdg3.x, bdg3.z)
                    break
                case 'z':
                    this.alpha = Math.PI * 1.0
                    this.beta = 0
                    bdg2 = new Vector2(bdg3.x, bdg3.y)
                    break
                case 'persp':
                    this.alpha = Math.PI * 1.2
                    this.beta = Math.PI * 0.4
                    bdg2 = Vector2.One().scale(bdg3.length() * 0.5)
                    break
            }
            if (bdg2.length() == 0) {
                bdg2 = new Vector2(1, 0)
            }
            bdg2 = bdg2.scale(1.05)
        } else {
            bdg2 = Vector2.Zero()
        }
        this.resetSize(bdg2.x, bdg2.y)
        this.resetMeshWidth()
    }
    zoom(evt) {
        if ('wheelDelta' in evt) {
            let scale = 1.2
            if (evt.wheelDelta > 1.0) {
                scale = 1.0 / scale
            }
            this.orthoLeft /= scale
            this.orthoRight /= scale
            this.orthoTop /= scale
            this.orthoBottom /= scale
            this.resetMeshWidth()
            this.radius = this.radiusStatic
        }
    }
    resetSize(width, height) {
        width /= 2
        height /= 2
        const scene = this.getScene()
        const engine = scene.getEngine()
        engine.resize(true)
        const w = engine.getRenderWidth() * window.devicePixelRatio
        const h = engine.getRenderHeight() * window.devicePixelRatio
        engine.setSize(w, h, true)
        const ratio = engine.getAspectRatio(this)
        if (width == 0 && height == 0) {
            this.orthoLeft = -this.orthoTop * ratio
            this.orthoRight = this.orthoTop * ratio
        } else {
            if (width > ratio * height) {
                this.orthoLeft = -width
                this.orthoRight = width
                this.orthoTop = width / ratio
                this.orthoBottom = -width / ratio
            } else {
                this.orthoLeft = -height * ratio
                this.orthoRight = height * ratio
                this.orthoTop = height
                this.orthoBottom = -height
            }
        }
    }
    resetMeshWidth() {
        const scene = this.getScene()
        const { point, line } = this.meshWidth
        scene.meshes
            .filter(mesh => mesh.name.match(/^n[a-z]*/))
            .map(mesh => {
                mesh.scaling = Vector3.One().scale(point)
            })
        scene.meshes
            .filter(mesh => mesh instanceof GreasedLineMesh)
            .map(mesh => {
                mesh.greasedLineMaterial.width = line
            })
    }
}

export { OrthoCamera }
