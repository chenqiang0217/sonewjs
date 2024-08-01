<script setup>
import { ref, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useMessageStore, Message } from '../../../stores/message'
import { viewResult } from './solution'
import Dialog from '../Dialog.vue'

const model = useModelStore()
const status = useStatusStore()
const messages = useMessageStore()
const to = 'client'
const option = ref({
    step: {
        loadStep: void 0,
        subStep: void 0,
        iterativeStep: void 0
    },
    tag: {
        node: {
            show: false,
            key: 'x',
            digits: 0
        },
        elem: {
            show: {
                text: false,
                contour: false
            },
            key: 'l',
            magnification: 1,
            digits: 0
        },
    },
    animation: {
        show: false,
        frameRate: 10,
        frameRates: [
            { label: '慢速', value: 20 },
            { label: '中速', value: 10 },
            { label: '快速', value: 5 }
        ]
    }
})


//保证荷载步的选择更新后，后续子步、迭代步的有效性。
watch(
    () => ({
        loadStep: option.value.step.loadStep,
        subStep: option.value.step.subStep
    }),
    ({ loadStep, subStep }) => {
        let result = model.result.filter(res => res.loadStep === loadStep).at(-1)
        if (result !== void 0 && loadStep > result.loadStep) {
            option.value.step.loadStep = result.loadStep
        }
        result = model.result
            .filter(res => res.loadStep === loadStep && res.subStep === subStep)
            .at(-1)
        if (result !== void 0 && option.value.step.iterativeStep !== void 0 && option.value.step.iterativeStep > result.iterativeStep) {
            option.value.step.iterativeStep = result.iterativeStep
        }
    }
)
watch(
    () => status.ui.dialog.apply,
    (apply) => {
        if (apply) {
            status.ui.dialog.apply = false
            onApply()
        }
    }
)
const onApply = () => {
    let index
    try {
        index = model.result.findIndex(
            res =>
                res.loadStep === option.value.step.loadStep &&
                res.subStep === option.value.step.subStep &&
                res.iterativeStep === option.value.step.iterativeStep
        )
    } catch (error) {
        messages.add({
            text: '获取结果错误',
            level: Message.TYPES.ERROR.LEVEL,
            to
        })
        return
    }
    if (index == -1) {
        messages.add({
            text: '获取结果错误',
            level: Message.TYPES.ERROR.LEVEL,
            to
        })
        return
    }
    status.task.view.index = index
    viewResult(index, option.value.tag, false, option.value.animation.frameRate, option.value.animation.frameRate)
    if (option.value.animation.show) {
        status.task.view.animation.show = true
        status.task.view.animation.frameRate = option.value.animation.frameRate
        status.task.view.animation.index = 0
        status.task.view.animation.iFrame = 0
        status.task.view.animation.elem.contour = option.value.tag.elem.show.contour
        status.task.view.animation.elem.key = option.value.tag.elem.key
    }
    else {
        status.task.view.animation.show = false
    }
}

const viewResultTable = mesh => {
    const index = model.result.findIndex(
        res =>
            res.loadStep === option.value.step.loadStep &&
            res.subStep === option.value.step.subStep &&
            res.iterativeStep === option.value.step.iterativeStep
    )
    if (index == -1) {
        messages.add({
            text: '获取结构错误',
            level: Message.TYPES.ERROR.LEVEL,
            to
        })
        return
    }
    status.task.view.index = index
    switch (mesh) {
        case 'node': {
            status.addMainTab('nodeRslt')
            break
        }
        case 'elem': {
            status.addMainTab('elemRslt')
            break
        }
    }
}
</script>

<template>
    <Dialog title="结果" :width="300">
        <el-form ref="form" :model="option" label-position="top">
            <el-form-item label="荷载步">
                <el-row :gutter="5">
                    <el-col :span="8">
                        <el-select v-model="option.step.loadStep" placeholder="荷载步" class="select">
                            <el-option v-for="loadStep in new Set(
                                model.result.map(res => res.loadStep)
                            )" :label="loadStep" :value="loadStep" :key="loadStep"></el-option>
                            <template #empty>
                                <el-text>无结果</el-text>
                            </template>
                        </el-select>
                    </el-col>
                    <el-col :span="8">
                        <el-select v-model="option.step.subStep" placeholder="子步" class="select">
                            <el-option v-for="subStep in new Set(
                                model.result
                                    .filter(
                                        res => res.loadStep == option.step.loadStep
                                    )
                                    .map(res => res.subStep)
                            )" :label="subStep" :value="subStep" :key="subStep"></el-option>
                            <template #empty>
                                <el-text>无结果</el-text>
                            </template>
                        </el-select>
                    </el-col>
                    <el-col :span="8" style="padding-right: 0;">
                        <el-select v-model="option.step.iterativeStep" placeholder="迭代步" class="select">
                            <el-option v-for="iterativeStep in new Set(
                                model.result
                                    .filter(
                                        res =>
                                            res.loadStep == option.step.loadStep &&
                                            res.subStep == option.step.subStep
                                    )
                                    .map(res => res.iterativeStep)
                            )" :label="iterativeStep" :value="iterativeStep" :key="iterativeStep"></el-option>
                            <template #empty>
                                <el-text>无结果</el-text>
                            </template>
                        </el-select>
                    </el-col>
                </el-row>
            </el-form-item>

            <el-form-item>
                <el-checkbox v-model="option.tag.node.show">节点数值</el-checkbox>
                <el-button @click="viewResultTable('node')">...</el-button>
            </el-form-item>
            <el-row>
                <el-col :span="8">
                    <el-form-item>
                        <el-text>类别：</el-text>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item>
                        <el-select v-model="option.tag.node.key" :disabled="!option.tag.node.show">
                            <el-option label="x坐标" value="x"></el-option>
                            <el-option label="y坐标" value="y"></el-option>
                            <el-option label="z坐标" value="z"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item>
                        <el-text>精度：</el-text>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item>
                        <el-input-number v-model="option.tag.node.digits" :min="0" :max="10" :step="1" step-strictly
                            :disabled="!option.tag.node.show" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item>
                        <el-checkbox v-model="option.tag.elem.show.text">单元数值</el-checkbox><el-button
                            @click="viewResultTable('elem')">...</el-button>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item>
                        <el-checkbox v-model="option.tag.elem.show.contour">等值线</el-checkbox>
                    </el-form-item>
                </el-col>
            </el-row>


            <el-row>
                <el-col :span="8">
                    <el-form-item>
                        <el-text>类别：</el-text>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item>
                        <el-select v-model="option.tag.elem.key"
                            :disabled="!option.tag.elem.show.text && !option.tag.elem.show.contour">
                            <!-- l,q,f为model.result.elem对应key -->
                            <el-option label="长度" value="l"></el-option>
                            <el-option label="力密度" value="q"></el-option>
                            <el-option label="预应力" value="f"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item>
                        <el-text>放大倍数：</el-text>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item>
                        <el-input-number v-model="option.tag.elem.magnification" :min="1" :step="1" step-strictly
                            :disabled="!option.tag.elem.show.text" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item>
                        <el-text>精度：</el-text>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item>
                        <el-input-number v-model="option.tag.elem.digits" :min="0" :max="10" :step="1" step-strictly
                            :disabled="!option.tag.elem.show.text" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item>
                <el-checkbox v-model="option.animation.show">播放</el-checkbox>
            </el-form-item>
            <el-form-item>
                <el-radio-group v-model="option.animation.frameRate" :disabled="!option.animation.show">
                    <el-radio v-for="{ value, label } in option.animation.frameRates" :value="value">{{ label
                        }}</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<style scoped>
.el-row,
.el-input-number {
    width: 100%
}

.el-button {
    padding: 0;
    border: 0;
}
</style>
