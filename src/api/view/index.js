import { Vector3 } from '@babylonjs/core'
import { MainScene } from './mainScene'
import { Control } from './control'
import { Material } from './material'
import { useViewConfigStore } from './config'
import { useViewStatusStore } from './status'
import { VIEWCONSTANT } from './constant'
import { Point } from './point'
import { Line } from './line'

//引用类型测试
// a = [{a:1}, {a:3}, {a:2}]
// b = new Set(a)
// c = Array.from(b)
// b.has(a[0]) //true
// b.has(c[0]) //true
// a[0] === c[0] //true
// a === b //false
// 结论：数组，集合操作，里面的对象元素是同一内存地址。

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
    }
    //在View.vue中进行配置
    get model() {
        return this.scene.metadata.useModel()
    }
    set model(useModel) {
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
        return { min, max }
    }
    createPoint(node, type = 'prep') {
        const point = new Point(node, this.scene, Point[type.toUpperCase()])
        this.points[type].push(point)
        return point
    }
    removePoint(node, type = 'prep') {
        const index = this.points[type].findIndex(
            point => point.mesh.metadata.no === node
        )
        if (index != -1) {
            this.points[type].splice(index, 1).forEach(point => point.remove())
        }
    }
    clearPoints(type = 'prep') {
        const points = this.points[type]
        for (let i = 0; i < points.length; i++) {
            points.pop().remove()
        }
    }
    createLine(elem, type = 'prep') {
        const line = new Line(elem, this.scene, Line[type.toUpperCase()])
        const ijNode = new Set([elem.iNode, elem.jNode])
        this.points[type]
            .filter(point => ijNode.has(point.mesh.metadata))
            .forEach(point => {
                point.linkedLines.add(line)
            })
        this.lines[type].push(line)
        return line
    }
    removeLine(elem, type = 'prep') {
        const index = this.lines[type].findIndex(
            line => line.mesh.metadata === elem
        )
        if (index != -1) {
            this.lines[type].splice(index, 1).forEach(line => line.remove())
        }
    }
    clearLines(type = 'prep') {
        const lines = this.lines[type]
        for (let i = 0; i < lines.length; i++) {
            lines.pop().remove()
        }
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

export { useView, useViewConfigStore, useViewStatusStore, VIEWCONSTANT}
