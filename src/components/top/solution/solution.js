import {markRaw} from 'vue'
// import {v4 as uuidv4} from 'uuid'
import {Node} from '../../../api/model/index'
import {useModelStore} from '../../../stores/model'
import {useMessageStore, Message} from '../../../stores/message'
import {useConfigStore} from '../../../stores/config'
import {useStatusStore} from '../../../stores/status'
import {CONSTANT} from '../../../stores/constant'
import {task} from '../../../api/request'
import {useView} from '../../../api/view/index'
import {
    byNoAsec,
    base64ToFloat64Array,
    float64ArrayToBase64
} from '../../../api/utils'
import Config from './Config.vue'
import Run from './Run.vue'
import Result from './Result.vue'

const showDialogSolutionConfig = () => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(Config)
    status.ui.dialog.show = true
}
const showDialogSolutionRun = () => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(Run)
    status.ui.dialog.show = true
}
const solutionRun = async () => {
    const model = useModelStore()
    const messages = useMessageStore()
    const status = useStatusStore()
    status.ui.tab.message.active = `server`
    const to = 'server'
    model.disposeResult()
    messages.add({
        text: '连接服务器',
        level: Message.TYPES.INFO.LEVEL,
        to
    })
    task.run(await modelJson(), handleResult)
    showSolutionProgress()
    status.task.run = CONSTANT.TASK.RUN.PROGRESS
    status.resetTaskResponse()
    messages.add({
        text: '获取计算结果',
        level: Message.TYPES.INFO.LEVEL,
        to,
        animation: true
    })
}
const showSolutionProgress = () => {
    const status = useStatusStore()
    status.addMainTab('runProgress')
}
const showDialogSolutionResult = () => {
    const status = useStatusStore()
    status.ui.dialog.component = markRaw(Result)
    status.ui.dialog.show = true
    resultViewInit()
}

const resultViewInit = () => {
    const model = useModelStore()
    const view = useView()
    const status = view.scene.metadata.useStatus()
    status.textBlock.visible.label.node = false
    status.textBlock.visible.label.elem = false
    status.textBlock.visible.target.all = false
    status.textBlock.visible.target.nodeShape.all = false
    status.textBlock.visible.target.elemShape.all = false
    status.textBlock.visible.target.elemForce.all = false
    view.control.hideTextBlock('target')
    if (view.points.rslt.length == 0 || view.lines.rslt.length == 0) {
        view.points.prep
            .filter(point =>
                model.categorized.node.free.find(
                    node => point.mesh.metadata === node
                )
            )
            .forEach(point => point.hide())
        view.lines.prep
            .filter(line =>
                model.categorized.elem.free.find(
                    elem => line.mesh.metadata === elem
                )
            )
            .forEach(line => line.hide())
        model.categorized.node.free.forEach(node => {
            view.createPoint(node.clone(), 'rslt').updateMeshColor(
                view.scene.metadata.materials.point.free
            )
        })
        const freeNode = view.points.rslt.map(point => point.mesh.metadata)
        model.categorized.elem.free.forEach(elem => {
            const iNode = freeNode.find(node => node.no == elem.iNode.no)
            const jNode = freeNode.find(node => node.no == elem.jNode.no)
            const el = elem.clone()
            el.iNode = iNode
            el.jNode = jNode
            view.createLine(el, 'rslt')
        })
    }
}

const modelJson = async () => {
    const model = useModelStore()
    const config = useConfigStore()
    const loadStep = model.loadStep.find((item, index) => {
        if (item.run) {
            item.no = index + 1
            return true
        } else {
            return false
        }
    })
    if (!loadStep) {
        const messages = useMessageStore()
        const to = 'server'
        messages.add({
            text: '未添加荷载步',
            level: Message.TYPES.ERROR.LEVEL,
            to
        })
        throw Error('error')
    }
    const node = new Float64Array(
        model.categorized.node.free
            .sort(byNoAsec)
            .map(node => node.asArray())
            .flat()
    )
    const elem = new Float64Array(
        model.categorized.elem.free
            .sort(byNoAsec)
            .map(elem => elem.asArrayShort())
            .flat()
    )
    const cnst = new Float64Array(
        model.cnst
            .sort((a, b) => a.node.no - b.node.no)
            .map(cnst => cnst.asArray())
            .flat()
    )
    const nodeShape = new Float64Array(
        model.target.nodeShape
            .filter(shape => loadStep.target.includes(shape.group))
            .map(shape => shape.asArray())
            .flat()
    )
    const elemShape = new Float64Array(
        model.target.elemShape
            .filter(shape => loadStep.target.includes(shape.group))
            .map(shape => shape.asArray())
            .flat()
    )
    const elemForce = new Float64Array(
        model.target.elemForce
            .filter(force => loadStep.target.includes(force.group))
            .map(force => force.asArray())
            .flat()
    )
    const elemForceInit = new Float64Array(
        model.categorized.elem.free
            .sort(byNoAsec)
            .map(elem => (elem.femType == 1 ? 1.0 : -1))
    )
    return JSON.stringify({
        node: await float64ArrayToBase64(node).then(s => s),
        elem: await float64ArrayToBase64(elem).then(s => s),
        cnst: await float64ArrayToBase64(cnst).then(s => s),
        nodeShape: await float64ArrayToBase64(nodeShape).then(s => s),
        elemShape: await float64ArrayToBase64(elemShape).then(s => s),
        elemForce: await float64ArrayToBase64(elemForce).then(s => s),
        elemForceInit: await float64ArrayToBase64(elemForceInit).then(s => s),
        config: {
            response: config.task.response,
            loadStep
        }
    })
}

const handleResult = result => {
    const model = useModelStore()
    const status = useStatusStore()
    const messages = useMessageStore()
    const to = 'server'
    const fixedNode = Array.from(
        new Set(model.categorized.cnst.map(cnst => cnst.node).flat())
    ).sort(byNoAsec)
    const deformedNode = model.categorized.node.free
        .filter(node => !fixedNode.find(fixedNode => fixedNode === node))
        .sort(byNoAsec)
    const freeElem = model.categorized.elem.free.sort(byNoAsec)
    let step, loadStep, subStep, iterativeStep, rsdl, rou, mu, nu, statusRes
    const steps = []
    const n = deformedNode.length
    let done = false
    for (const res of result) {
        statusRes = res.status
        status.task.run = statusRes
        if (statusRes == CONSTANT.TASK.RUN.ABORT) {
            messages.add({
                text: '计算中断',
                level: Message.TYPES.ERROR.LEVEL,
                to
            })
            return
        } else if (statusRes == CONSTANT.TASK.RUN.END) {
            done = true
            break
        }
        let p = [].slice.call(base64ToFloat64Array(res.x))
        let d = [].slice.call(base64ToFloat64Array(res.q))
        step = res.step
        loadStep = res.loadStep
        subStep = res.subStep
        iterativeStep = res.iterativeStep
        rsdl = [].slice.call(base64ToFloat64Array(res.rsdl)).shift()
        rou = [].slice.call(base64ToFloat64Array(res.rou)).shift()
        mu = [].slice.call(base64ToFloat64Array(res.mu)).shift()
        nu = [].slice.call(base64ToFloat64Array(res.nu)).shift()
        const node = deformedNode.map(
            (node, i) => new Node([node.no, p[i], p[n + i], p[2 * n + i]])
        )
        const freeNode = [...node, ...fixedNode]
        const elem = freeElem.map(elem => {
            const iNode = freeNode.find(node => node.no === elem.iNode.no)
            const jNode = freeNode.find(node => node.no === elem.jNode.no)
            const l = jNode.position.subtract(iNode.position).length()
            const q = d.shift()
            const f = q * l
            return {no: elem.no, l, q, f}
        })
        //q,f归一化
        const {l, q, f} = elem[0]
        let [lMax, lMin, qMax, qMin, fMax, fMin] = [l, l, q, q, f, f]
        elem.forEach(elem => {
            if (elem.l > lMax) lMax = elem.l
            if (elem.l < lMin) lMin = elem.l
            if (elem.q > qMax) qMax = elem.q
            if (elem.q < qMin) qMin = elem.q
            if (elem.f > fMax) fMax = elem.f
            if (elem.f < fMin) fMin = elem.f
        })
        if (Math.abs(qMax) < Math.abs(qMin)) [qMax, qMin] = [qMin, qMax]
        if (Math.abs(fMax) < Math.abs(fMin)) [fMax, fMin] = [fMin, fMax]
        elem.forEach(elem => {
            elem.q /= qMax
            elem.f /= fMax
        })
        const resElem = {
            l: {
                min: lMin,
                max: lMax
            },
            q: {
                min: qMin / qMax,
                max: 1.0
            },
            f: {
                min: fMin / fMax,
                max: 1.0
            }
        }
        model.result.push({
            status: statusRes,
            step,
            loadStep,
            subStep,
            iterativeStep,
            node,
            elem,
            summarized: {
                elem: resElem
            },
            rsdl,
            rou,
            mu,
            nu
        })
        steps.push([loadStep, subStep, iterativeStep])
    }
    let [start, end] = [0, 0]
    if (result.length != 0) {
        status.task.response.step = step
        status.task.response.loadStep = loadStep
        status.task.response.subStep = subStep
        status.task.response.iterativeStep = iterativeStep
        status.task.run = statusRes
        start = ': (' + steps.at(0) + ')'
        end = ' ~ (' + steps.at(-1) + ')'
    }
    if (done) {
        if (model.result.at(-1)?.status == CONSTANT.TASK.RUN.SUCCESS) {
            messages.add({
                text: '计算成功',
                level: Message.TYPES.SUCCESS.LEVEL,
                to
            })
        } else {
            messages.add({
                text: '计算不收敛',
                level: Message.TYPES.WARNING.LEVEL,
                to
            })
        }
        return
    }
    messages.add({
        text:
            '获取计算结果共' +
            steps.length +
            '步' +
            (steps.length != 0 ? start : '') +
            (steps.length >= 2 ? end : ''),
        level: Message.TYPES.INFO.LEVEL,
        to
    })
    messages.add({
        text: '获取计算结果',
        level: Message.TYPES.INFO.LEVEL,
        to,
        animation: true
    })
}

export {
    showDialogSolutionConfig,
    showDialogSolutionRun,
    solutionRun,
    showSolutionProgress,
    showDialogSolutionResult
}
