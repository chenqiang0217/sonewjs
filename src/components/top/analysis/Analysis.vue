<script setup>
import { v4 as uuidv4 } from "uuid"
import { ref } from "vue"
import { useModelStore, Node } from "../../../stores/model"
import { useMessageStore } from "../../../stores/message"
import { useConfigStore } from "../../../stores/config"
import { useStatusStore } from "../../../stores/status"
import { CONSTANT } from "../../../stores/constant"
import { task } from "../../../api/request"
import { SetOperation, sortNumber, sleep, base64ToFloat64Array } from '../../../api/utils'
import Solution from "../../dialog/Solution.vue"
import Result from "../../dialog/Result.vue"

const model = useModelStore()
const messages = useMessageStore()
const config = useConfigStore()
const status = useStatusStore()

const showSolutionDialog = ref(false)
const showResultDialog = ref(false)
const formData = () => {
    const taskConfig = { uuid: config.task.uuid, loadStep: config.task.loadStep }
    const node = new Float64Array(
        model.node.map(node => node.toArray()).flat()
    )
    const elem = new Float64Array(
        model.elem.map(elem => elem.toArray()).flat()
    )
    const cnst = new Float64Array(
        model.cnst.map(cnst => cnst.toArray()).flat()
    )
    const nodeShape = new Float64Array(
        model.nodeShape.map(shape => shape.toArray()).flat()
    )
    const elemShape = new Float64Array(
        model.elemShape.map(shape => shape.toArray()).flat()
    )
    const elemForce = new Float64Array(
        model.elemForce.map(force => force.toArray()).flat()
    )
    const formData = new FormData()
    formData.append("config", JSON.stringify(taskConfig))
    formData.append("node", new Blob([node.buffer]))
    formData.append("elem", new Blob([elem.buffer]))
    formData.append("cnst", new Blob([cnst.buffer]))
    formData.append("nodeShape", new Blob([nodeShape.buffer]))
    formData.append("elemShape", new Blob([elemShape.buffer]))
    formData.append("elemForce", new Blob([elemForce.buffer]))
    return formData
}

const run = () => {
    status.ui.tab.message.active = `server`
    model.result = []
    status.task.run = CONSTANT.TASK.RUN.START

    const uuid = config.task.uuid
    // const uuid = uuidv4()
    // config.task.uuid = uuid


    messages.add({
        to: "server",
        level: "info",
        content: "开始计算:" + uuid,
    })


    // task.run(formData())
    //     .then(function (response) {
    //         //计算完成
    //         status.task.run = CONSTANT.TASK.RUN.SUCCESS
    //         messages.add({ to: 'server', level: 'sucess', content: '计算完成' })
    //     })
    //     .catch(function (error) {
    //         //计算错误
    //         // status.task.run = CONSTANT.TASK.RUN.ABORT
    //         messages.add({ to: 'server', level: 'error', content: '计算错误' })
    //     })
    //     .finally(function () {
    //     })


    status.addMainTab("runProgress")
    let delay = config.task.result.query.delaySecond
    sleep(delay).then(queryResult({ uuid }))
}

const queryResult = async (opt) => {
    if (status.task.run === CONSTANT.TASK.RUN.ABORT) {
        return null
    }
    const {
        uuid,
        step = 0,
        loadStep = 0,
        subStep = 0,
        iterativeStep = 0,
        count = config.task.result.query.count,
    } = opt
    messages.add({
        to: "server",
        level: "info",
        content:
            "获取计算结果:" +
            step +
            " (" +
            loadStep +
            "," +
            subStep +
            "," +
            iterativeStep +
            ")",
    })
    const options = { uuid, step, loadStep, subStep, iterativeStep, count }
    const formData = new FormData()
    formData.append("options", JSON.stringify(options))
    let response
    try {
        status.task.query.retry += 1
        response = await task.result.query(formData)
    } catch (error) {
        status.task.run = CONSTANT.TASK.RUN.ABORT
        messages.add({
            to: "server",
            level: "error",
            content: "获取计算结果错误" + status.task.query.retry,
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
        status.task.run = CONSTANT.TASK.RUN.ABORT
        messages.add({
            to: "server",
            level: "error",
            content: "处理计算结果错误",
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
    }
    else if (isCompleted == 1) {
        messages.add({
            to: "server",
            level: "success",
            content: "获取计算结果完成",
        })
        // await task.result.delete({ uuid: options.uuid })
    }
    else if (isCompleted == 2) {
        messages.add({
            to: "server",
            level: "warming",
            content: "计算结果不收敛",
        })
    }
}

const handleResult = (result) => {
    const fixedNode = new Set(model.categorized.cnst.map(cnst => cnst.node).flat())
    const deformedNode = Array.from(SetOperation(model.categorized.node.free, fixedNode, 'delete')).sort(sortNumber)
    const freeElem = Array.from(model.categorized.elem.free).sort(sortNumber)
    const index = freeElem.map(no => {
        let elem = model.elem.find(elem => elem.no == no)
        return [
            [...deformedNode, ...fixedNode].findIndex(no => no == elem.iNode),
            [...deformedNode, ...fixedNode].findIndex(no => no == elem.jNode),
        ]
    })
    let isCompleted = false
    let step, loadStep, subStep, iterativeStep, rsdl, rou, mu, nu
    const n = deformedNode.length
    result.forEach(res => {
        let p = [].slice.call(base64ToFloat64Array(res.x))
        let d = [].slice.call(base64ToFloat64Array(res.q))
        let node = []
        isCompleted = res.isCompleted
        step = res.step
        loadStep = res.loadStep
        subStep = res.subStep
        iterativeStep = res.iterativeStep
        rsdl = [].slice.call(base64ToFloat64Array(res.rsdl)).shift()
        rou = [].slice.call(base64ToFloat64Array(res.rou)).shift()
        mu = [].slice.call(base64ToFloat64Array(res.mu)).shift()
        nu = [].slice.call(base64ToFloat64Array(res.nu)).shift()
        deformedNode.forEach((no, i) => node.push(
            new Node([no, p[i], p[n + i], p[2 * n + i]])
        ))
        fixedNode.forEach(no => node.push(
            model.node.find(node => node.no == no)
        ))
        const elem = freeElem.map((no, k) => {
            let [iRow, jRow] = index[k]
            let iNode = node[iRow]
            let jNode = node[jRow]
            let length = Math.sqrt((iNode.x - jNode.x) ** 2 + (iNode.y - jNode.y) ** 2 + (iNode.z - jNode.z) ** 2)
            let q = d.shift()
            let f = q * length
            return { no, length, q, f }
        })
        //q,f归一化
        let [lMax, lMin, qMax, qMin, fMax, fMin] = [0, 0, 0, 0, 0, 0]
        elem.forEach(elem => {
            if (elem.length > lMax) lMax = elem.length
            if (elem.length < lMin) lMin = elem.length
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
        const summarized = {
            length: {
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
            },
        }
        model.result.push({ isCompleted, step, loadStep, subStep, iterativeStep, node, elem, summarized, rsdl, rou, mu, nu })
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

</script>

<template>
    <el-button-group>
        <el-tooltip content="run setting" placement="bottom">
            <el-button @click="showSolutionDialog = !showSolutionDialog">
                <IconFront iconName="run-setting"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="run" placement="bottom">
            <el-button @click="run()">
                <IconFront iconName="run"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="计算进度" placement="bottom">
            <el-button @click="status.addMainTab('runProgress')">
                <IconFront iconName="result"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="结果" placement="bottom">
            <el-button @click="showResultDialog = !showResultDialog">
                <IconFront iconName="deformation-element-density"></IconFront>
            </el-button>
        </el-tooltip>
    </el-button-group>

    <Solution
        v-model:show="showSolutionDialog"
        title="求解设置"
        :show="showSolutionDialog"
    />
    <Result
        v-model:show="showResultDialog"
        title="结果查看"
        :show="showResultDialog"
    />
</template>

<style></style>
