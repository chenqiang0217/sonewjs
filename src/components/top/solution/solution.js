import {v4 as uuidv4} from 'uuid'
import {Node} from '../../../api/model/index'
import {useModelStore} from '../../../stores/model'
import {useMessageStore} from '../../../stores/message'
import {useConfigStore} from '../../../stores/config'
import {useStatusStore} from '../../../stores/status'
import {CONSTANT} from '../../../stores/constant'
import {task} from '../../../api/request'
import {useView} from '../../../api/view/index'
import {byNoAsec, sleep, base64ToFloat64Array} from '../../../api/utils'
import Config from './Config.vue'
import Result from './Result.vue'

const showDialogSolutionConfig = () => {
    const status = useStatusStore()
    status.ui.dialog.component.is = Config
    status.ui.dialog.show = true
    status.ui.dialog.title = '设置'
    status.ui.dialog.width = 450
}
const solutionRun = () => {
    const model = useModelStore()
    const messages = useMessageStore()
    const config = useConfigStore()
    const status = useStatusStore()

    status.ui.tab.message.active = `server`
    model.result = []
    status.task.run = CONSTANT.TASK.RUN.START

    // const uuid = status.task.uuid
    const uuid = uuidv4()
    status.task.uuid = uuid

    messages.add({
        to: 'server',
        level: 'info',
        content: '开始计算:' + uuid
    })

    task.run(formData())
        .then(function (response) {
            //计算完成
            status.task.run = CONSTANT.TASK.RUN.SUCCESS
            messages.add({to: 'server', level: 'sucess', content: '计算完成'})
        })
        .catch(function (error) {
            //计算错误
            // status.task.run = CONSTANT.TASK.RUN.ABORT
            messages.add({to: 'server', level: 'error', content: '计算错误'})
        })
        .finally(function () {})
    showSolutionProgress()
    let delay = config.task.result.query.delaySecond
    sleep(delay).then(queryResult({uuid}))
}
const showSolutionProgress = () => {
    const status = useStatusStore()
    status.addMainTab('runProgress')
}
const showDialogSolutionResult = () => {
    const status = useStatusStore()
    status.ui.dialog.component.is = Result
    status.ui.dialog.show = true
    status.ui.dialog.title = '结果查看'
    status.ui.dialog.width = 250
    resultViewInit()
}

const resultViewInit = () => {
    const model = useModelStore()
    const view = useView()
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
            view.createPoint(node.clone(), 'rslt')
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

const formData = () => {
    const model = useModelStore()
    const config = useConfigStore()
    const status = useStatusStore()
    const taskConfig = {
        uuid: status.task.uuid,
        loadStep: config.task.loadStep
    }
    const node = new Float64Array(
        model.categorized.node.free
            .sort(byNoAsec)
            .map(node => node.toArray())
            .flat()
    )
    const elem = new Float64Array(
        model.categorized.elem.free
            .sort(byNoAsec)
            .map(elem => elem.toArrayShort())
            .flat()
    )
    const cnst = new Float64Array(
        model.cnst
            .sort((a, b) => a.node.no - b.node.no)
            .map(cnst => cnst.toArray())
            .flat()
    )
    const nodeShape = new Float64Array(
        model.target.nodeShape.map(shape => shape.toArray()).flat()
    )
    const elemShape = new Float64Array(
        model.target.elemShape.map(shape => shape.toArray()).flat()
    )
    const elemForce = new Float64Array(
        model.target.elemForce.map(force => force.toArray()).flat()
    )
    const elemForceInit = new Float64Array(
        model.categorized.elem.free
            .sort(byNoAsec)
            .map(elem => (elem.femType == 1 ? 1.0 : -1))
    )
    const formData = new FormData()
    formData.append('config', JSON.stringify(taskConfig))
    formData.append('node', new Blob([node.buffer]))
    formData.append('elem', new Blob([elem.buffer]))
    formData.append('cnst', new Blob([cnst.buffer]))
    formData.append('nodeShape', new Blob([nodeShape.buffer]))
    formData.append('elemShape', new Blob([elemShape.buffer]))
    formData.append('elemForce', new Blob([elemForce.buffer]))
    formData.append('elemForceInit', new Blob([elemForceInit.buffer]))

    return formData
}

const queryResult = async opt => {
    const status = useStatusStore()
    const config = useConfigStore()
    const messages = useMessageStore()
    if (status.task.run === CONSTANT.TASK.RUN.ABORT) {
        return null
    }
    const {
        uuid,
        step = 0,
        loadStep = 0,
        subStep = 0,
        iterativeStep = 0,
        count = config.task.result.query.count
    } = opt
    messages.add({
        to: 'server',
        level: 'info',
        content:
            '获取计算结果:' +
            step +
            ' (' +
            loadStep +
            ',' +
            subStep +
            ',' +
            iterativeStep +
            ')'
    })
    const options = {uuid, step, loadStep, subStep, iterativeStep, count}
    const formData = new FormData()
    formData.append('options', JSON.stringify(options))
    let response
    try {
        status.task.query.retry += 1
        response = await task.result.query(formData)
    } catch (error) {
        // status.task.run = CONSTANT.TASK.RUN.ABORT
        messages.add({
            to: 'server',
            level: 'error',
            content: '获取计算结果错误' + status.task.query.retry
        })
        // if (status.task.query.retry <= config.task.result.query.retry) {
        //     queryResult(options)
        // }
    }
    let isCompleted = false
    try {
        isCompleted = handleResult(response.data)
        if (isCompleted) {
            status.task.run = CONSTANT.TASK.RUN.SUCCESS
        }
    } catch (error) {
        // status.task.run = CONSTANT.TASK.RUN.ABORT
        messages.add({
            to: 'server',
            level: 'error',
            content: '处理计算结果错误'
        })
    }
    if (isCompleted == 0) {
        options.step = status.task.query.step
        options.loadStep = status.task.query.loadStep
        options.subStep = status.task.query.subStep
        options.iterativeStep = status.task.query.iterativeStep
        let delay = config.task.result.query.delaySecond
        await sleep(delay)
        queryResult(options)
    } else if (isCompleted == 1) {
        messages.add({
            to: 'server',
            level: 'success',
            content: '获取计算结果完成'
        })
        // await task.result.delete({ uuid: options.uuid })
    } else if (isCompleted == 2) {
        messages.add({
            to: 'server',
            level: 'warming',
            content: '计算结果不收敛'
        })
    }
}

const handleResult = result => {
    const model = useModelStore()
    const status = useStatusStore()
    const fixedNode = Array.from(
        new Set(model.categorized.cnst.map(cnst => cnst.node).flat())
    ).sort(byNoAsec)
    const deformedNode = model.categorized.node.free
        .filter(node => !fixedNode.find(fixedNode => fixedNode === node))
        .sort(byNoAsec)
    const freeElem = model.categorized.elem.free.sort(byNoAsec)
    let isCompleted = false
    let step, loadStep, subStep, iterativeStep, rsdl, rou, mu, nu
    const n = deformedNode.length
    result.forEach(res => {
        let p = [].slice.call(base64ToFloat64Array(res.x))
        let d = [].slice.call(base64ToFloat64Array(res.q))
        isCompleted = res.isCompleted
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
        const elemSummarized = {
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
            isCompleted,
            step,
            loadStep,
            subStep,
            iterativeStep,
            node,
            elem,
            summarized: {
                elem: elemSummarized
            },
            rsdl,
            rou,
            mu,
            nu
        })
        if (isCompleted != 0 || isCompleted != 1) {
            return isCompleted
        }
    })
    if (result.length != 0) {
        status.task.query.step = step
        status.task.query.loadStep = loadStep
        status.task.query.subStep = subStep
        status.task.query.iterativeStep = iterativeStep
    }
    return isCompleted
}

export {
    showDialogSolutionConfig,
    solutionRun,
    showSolutionProgress,
    showDialogSolutionResult
}
