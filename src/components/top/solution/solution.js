import {v4 as uuidv4} from 'uuid'
import {Node} from '../../../api/model/index'
import {useModelStore} from '../../../stores/model'
import {useMessageStore, Message} from '../../../stores/message'
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
    const status = useStatusStore()

    status.ui.tab.message.active = `server`
    const to = 'server'
    model.result = []

    // const uuid = status.task.uuid
    const uuid = uuidv4()
    status.task.uuid = uuid

    messages.add({
        // text: '开始计算，任务编码:' + uuid,
        text: '开始计算，向服务器发送计算数据',
        level: Message.TYPES.INFO.LEVEL,
        to
    })

    task.run(formData())
        .then(function (response) {
            //计算完成
            switch (response.status) {
                case CONSTANT.TASK.RUN.SUCCESS:
                    messages.add({
                        text: '计算完成',
                        level: Message.TYPES.SUCCESS.LEVEL,
                        to
                    })
                    break
                case CONSTANT.TASK.RUN.FAIL:
                    messages.add({
                        text: '计算未收敛',
                        level: Message.TYPES.WARNING.LEVEL,
                        to
                    })
                    break
                case CONSTANT.TASK.RUN.ABORT:
                    status.task.run = CONSTANT.TASK.RUN.ABORT
                    messages.add({
                        text: '模型存在致命错误，计算中止',
                        level: Message.TYPES.ERROR.LEVEL,
                        to
                    })
                    break
            }
        })
        .catch(function () {
            status.task.run = CONSTANT.TASK.RUN.ABORT
            messages.add({
                text: '服务器响应超时',
                level: Message.TYPES.ERROR.LEVEL,
                to
            })
        })
        .finally(function () {})
    showSolutionProgress()
    status.task.run = CONSTANT.TASK.RUN.PROGRESS
    status.task.query.retry = 0
    queryResult({uuid})
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
    const delay = config.task.result.query.delaySecond
    const to = 'server'
    messages.add({
        text: '获取计算结果',
        level: Message.TYPES.INFO.LEVEL,
        to,
        delay,
    })
    await sleep(delay)
    const {
        uuid,
        step = 0,
        loadStep = 0,
        subStep = 0,
        iterativeStep = 0,
        count = config.task.result.query.count
    } = opt
    const options = {uuid, step, loadStep, subStep, iterativeStep, count}
    const formData = new FormData()
    formData.append('options', JSON.stringify(options))
    let response
    try {
        status.task.query.retry += 1
        if(status.task.run != CONSTANT.TASK.RUN.ABORT){
            status.task.query.retry += 1
            response = await task.result.query(formData)
        }
        else{
            return
        }
    } catch (error) {
        status.task.run = CONSTANT.TASK.RUN.ABORT
        messages.add({
            text: '获取计算结果错误',
            level: Message.TYPES.ERROR.LEVEL,
            to,
        })
        return
    }
    const {statusRes, steps} = handleResult(response.data)
    if (statusRes != CONSTANT.TASK.RUN.PROGRESS) {
        status.task.run = statusRes
    }
    let start, end
    if (steps.length != 0) {
        start = ': (' + steps.at(0) + ')'
        end = ' ~ (' + steps.at(-1) + ')'
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
    switch (statusRes) {
        case CONSTANT.TASK.RUN.PROGRESS:
            options.step = status.task.query.step
            options.loadStep = status.task.query.loadStep
            options.subStep = status.task.query.subStep
            options.iterativeStep = status.task.query.iterativeStep
            queryResult(options)
            break
        case CONSTANT.TASK.RUN.SUCCESS:
            messages.add({
                text: '获取计算结果完成',
                level: Message.TYPES.SUCCESS.LEVEL,
                to
            })
            // await task.result.delete({ uuid: options.uuid })
            break
        case CONSTANT.TASK.RUN.FAIL:
            messages.add({
                text: '计算结果不收敛',
                level: Message.TYPES.WARNING.LEVEL,
                to
            })
            break
        case CONSTANT.TASK.RUN.ABORT:
            messages.add({
                text: '计算错误',
                level: Message.TYPES.ERROR.LEVEL,
                to
            })
            break
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
    let statusRes = CONSTANT.TASK.RUN.PROGRESS
    let step, loadStep, subStep, iterativeStep, rsdl, rou, mu, nu
    const steps = []
    const n = deformedNode.length
    result.forEach(res => {
        let p = [].slice.call(base64ToFloat64Array(res.x))
        let d = [].slice.call(base64ToFloat64Array(res.q))
        statusRes = res.status
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
    })
    if (result.length != 0) {
        status.task.query.step = step
        status.task.query.loadStep = loadStep
        status.task.query.subStep = subStep
        status.task.query.iterativeStep = iterativeStep
    }
    return {statusRes, steps}
}

export {
    showDialogSolutionConfig,
    solutionRun,
    showSolutionProgress,
    showDialogSolutionResult
}
