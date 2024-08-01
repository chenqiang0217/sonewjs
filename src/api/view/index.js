import {watch} from 'vue'
import {Vector3} from '@babylonjs/core'
import {MainScene} from './mainScene'
import {Control} from './control'
import {Material} from './material'
import {useViewConfigStore} from './config'
import {useViewStatusStore} from './status'
import {VIEWCONSTANT} from './constant'
import {Point} from './point'
import {Line} from './line'
import {Color3} from '@babylonjs/core'

class View {
    constructor() {
        const config = useViewConfigStore()
        const canvas = document.getElementById(config.canvas)
        this.scene = new MainScene(canvas)
        this.scene.metadata = {
            constant: VIEWCONSTANT,
            useConfig: useViewConfigStore,
            useStatus: useViewStatusStore,
            materials: new Material(this.scene)
        }
        this.control = new Control(this.scene)
        this.points = {
            prep: [],
            rslt: []
        }
        this.lines = {
            prep: [],
            rslt: []
        }
        this.symbols = {
            target: {
                nodeShape: [],
                elemShape: [],
                elemForce: []
            }
        }
    }
    //在View.vue中进行配置
    get useModel() {
        return this.scene.metadata.useModel
    }
    set useModel(useModel) {
        this.scene.metadata.useModel = useModel
    }
    get bounding() {
        let min = new Vector3(Infinity, Infinity, Infinity)
        let max = new Vector3(-Infinity, -Infinity, -Infinity)
        const points = [...this.points.prep, ...this.points.rslt]
        if (points.length == 0) {
            min = new Vector3(-1.0, -1.0, -1.0)
            max = new Vector3(1.0, 1.0, 1.0)
        } else {
            points.forEach(point => {
                const boundingBox = point.position
                min = Vector3.Minimize(min, boundingBox)
                max = Vector3.Maximize(max, boundingBox)
            })
        }
        return {min, max}
    }
    watchNodeTypeChange() {
        const model = this.scene.metadata.useModel()
        Array.from(['free', 'lock']).forEach(type => {
            watch(
                () => model.categorized.node[type],
                (now, pre) => {
                    now.filter(now => !pre.find(pre => pre === now)).forEach(
                        node =>
                            this.points.prep
                                .find(point => point.mesh.metadata === node)
                                .updateMeshColor(
                                    this.scene.metadata.materials.point[type]
                                )
                    )
                }
            )
        })
    }
    createPoint(node, type = 'prep') {
        const point = new Point(node, this.scene, Point[type.toUpperCase()])
        this.points[type].push(point)
        return point
    }
    disposePoint(node, type = 'prep') {
        const index = this.points[type].findIndex(
            point => point.mesh.metadata.no === node
        )
        if (index != -1) {
            this.points[type].splice(index, 1).forEach(point => point.dispose())
        }
    }
    clearPoints(type = 'prep') {
        const points = this.points[type]
        points.forEach(point => point.dispose())
        points.splice(0, points.length)
        
    }
    createLine(elem, type = 'prep') {
        const line = new Line(elem, this.scene, Line[type.toUpperCase()])
        this.lines[type].push(line)
        return line
    }
    disposeLine(elem, type = 'prep') {
        const index = this.lines[type].findIndex(
            line => line.mesh.metadata === elem
        )
        if (index != -1) {
            this.lines[type].splice(index, 1).forEach(line => line.dispose())
        }
    }
    clearLines(type = 'prep') {
        const lines = this.lines[type]
        lines.forEach(line => line.dispose())
        lines.splice(0, lines.length)
    }
}

const useView = (function () {
    let view
    return function () {
        if (!view) {
            view = new View()
        }
        return view
    }
})()

export {useView, useViewConfigStore, useViewStatusStore, VIEWCONSTANT, Color3}
