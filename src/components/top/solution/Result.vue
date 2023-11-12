<script setup>
import { ref, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useConfigStore } from '../../../stores/config'
import { useStatusStore } from '../../../stores/status'
import {
    drawPointsInScene,
    drawLinesInScene,
    linkTextsWithMeshs,
    setGadientColorForLines
} from '../../../stores/view'
import { CONSTANT } from '../../../stores/constant'

const model = useModelStore()
const config = useConfigStore()
const status = useStatusStore()
const option = ref({
    step: {
        loadStep: 1,
        subStep: 1,
        iterativeStep: 1
    },
    label: {
        none: 0,
        node: 1,
        elem: 2
    },
    contour: {
        show: false
    },
    legend: {
        show: false
    },
    shape: {
        show: false
    },
    nodeTag: {
        show: false,
        key: '',
        digits: 0
    },
    elemTag: {
        show: false,
        key: '',
        magnification: 1,
        digits: 0
    }
})
const isMeshRsltExisted = ref(false)

//保证荷载步的选择更新后，后续子步、迭代步的有效性。
watch(
    () => ({
        loadStep: option.value.step.loadStep,
        subStep: option.value.step.subStep
    }),
    ({ loadStep, subStep }) => {
        let result = model.result.filter(res => res.loadStep == loadStep).at(-1)
        if (loadStep > result.loadStep) {
            option.value.step.loadStep = result.loadStep
        }
        result = model.result
            .filter(res => res.loadStep == loadStep && res.subStep == subStep)
            .at(-1)
        if (option.value.step.iterativeStep > result.iterativeStep) {
            option.value.step.iterativeStep = result.iterativeStep
        }
    }
)

const viewResultSecne = () => {
    // //表单验证
    // if ((option.nodeTag.show && !option.nodeTag.key)
    //     || (option.elemTag.show && !option.elemTag.key)
    // ) {
    //     return
    // }
    let step
    try {
        step = model.result.find(
            res =>
                res.loadStep === option.value.step.loadStep &&
                res.subStep === option.value.step.subStep &&
                res.iterativeStep === option.value.step.iterativeStep
        ).step
    } catch (error) {
        return
    }
    status.mode = CONSTANT.MODE.RSLT
    drawPointsInScene(
        model.categorized.node.free,
        CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT,
        step
    )
    drawLinesInScene(
        model.categorized.elem.free,
        CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT
    )
    if (!isMeshRsltExisted.value) {
        //所有节点freeze
        status.view.mesh.todo.freeze.node.prep = new Set(
            model.categorized.node.all
        )
        status.view.mesh.todo.freeze.node.rslt = new Set(
            model.categorized.node.free
        )
        //所有节点freeze
        status.view.mesh.todo.freeze.elem.prep = new Set(
            model.categorized.elem.free
        )
        //隐藏mesh text
        status.view.text.visible.node = false
        status.view.text.visible.elem = false
        //为rslt mesh生成编号
        linkTextsWithMeshs(
            Array.from(model.categorized.node.free).map(no => {
                return { no }
            }),
            CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT
        )
        linkTextsWithMeshs(
            Array.from(model.categorized.elem.free).map(no => {
                return { no }
            }),
            CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT
        )
        //激活rslt mesh text
        status.view.text.activated.node.prep.clear()
        status.view.text.activated.elem.prep.clear()
        status.view.text.activated.node.rslt = new Set(
            model.categorized.node.free
        )
        status.view.text.activated.elem.rslt = new Set(
            model.categorized.elem.free
        )
        isMeshRsltExisted.value = true
    }
    //text内容
    if (option.value.nodeTag.show) {
        const key = option.value.nodeTag.key
        const digits = option.value.nodeTag.digits
        linkTextsWithMeshs(
            Array.from(model.categorized.node.free).map(no => {
                return {
                    no,
                    text: model.result
                        .find(res => res.step === step)
                        .node.find(node => node.no == no)
                        [key].toFixed(digits)
                }
            }),
            CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT
        )
        status.view.text.visible.node = true
    } else {
        status.view.text.visible.node = false
    }
    if (option.value.elemTag.show) {
        const key = option.value.elemTag.key
        const magnification = option.value.elemTag.magnification
        const digits = option.value.elemTag.digits
        linkTextsWithMeshs(
            Array.from(model.categorized.elem.free).map(no => {
                return {
                    no,
                    text: (
                        model.result
                            .find(res => res.step === step)
                            .elem.find(elem => elem.no == no)[key] *
                        magnification
                    ).toFixed(digits)
                }
            }),
            CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT
        )
        status.view.text.visible.elem = true
        //为单元设置渐变色
        config.view.elem.color.calculated.gadient.by = key
        setGadientColorForLines(model.categorized.elem.free, step)
    } else {
        status.view.text.visible.elem = false
    }
}

const viewResultTable = mesh => {
    const step = model.result.find(
        res =>
            res.loadStep === option.value.step.loadStep &&
            res.subStep === option.value.step.subStep &&
            res.iterativeStep === option.value.step.iterativeStep
    ).step
    status.result.option.step = step
    switch (mesh) {
        case 'node': {
            status.addMainTab('deformation')
            break
        }
        case 'elem': {
            status.addMainTab('force')
            break
        }
    }
}
</script>

<template>
    <el-form
        ref="form"
        :model="option"
        label-position="top"
    >
        <el-form-item label="荷载步">
            <div class="flex-Wrapper">
                <el-select
                    v-model="option.step.loadStep"
                    placeholder="荷载步"
                    class="select"
                >
                    <el-option
                        v-for="loadStep in new Set(
                            model.result.map(res => res.loadStep)
                        )"
                        :label="loadStep"
                        :value="loadStep"
                        :key="loadStep"
                    ></el-option>
                </el-select>
                <el-select
                    v-model="option.step.subStep"
                    placeholder="子步"
                    class="select"
                >
                    <el-option
                        v-for="subStep in new Set(
                            model.result
                                .filter(
                                    res => res.loadStep == option.step.loadStep
                                )
                                .map(res => res.subStep)
                        )"
                        :label="subStep"
                        :value="subStep"
                        :key="subStep"
                    ></el-option>
                </el-select>
                <el-select
                    v-model="option.step.iterativeStep"
                    placeholder="迭代步"
                    class="select"
                >
                    <el-option
                        v-for="iterativeStep in new Set(
                            model.result
                                .filter(
                                    res =>
                                        res.loadStep == option.step.loadStep &&
                                        res.subStep == option.step.subStep
                                )
                                .map(res => res.iterativeStep)
                        )"
                        :label="iterativeStep"
                        :value="iterativeStep"
                        :key="iterativeStep"
                    ></el-option>
                </el-select>
            </div>
        </el-form-item>

        <el-form-item>
            <el-checkbox v-model="option.nodeTag.show">节点数值</el-checkbox
            ><el-button @click="viewResultTable('node')">...</el-button>
            <div
                class="grid-Wrapper1"
                v-show="option.nodeTag.show"
            >
                <div class="align-right">类别：</div>
                <div>
                    <el-select v-model="option.nodeTag.key">
                        <el-option
                            label="请选择："
                            value=""
                            disabled
                        ></el-option>
                        <el-option
                            label="x坐标"
                            value="x"
                        ></el-option>
                        <el-option
                            label="y坐标"
                            value="y"
                        ></el-option>
                        <el-option
                            label="z坐标"
                            value="z"
                        ></el-option>
                    </el-select>
                </div>
                <div class="align-right">精度：</div>
                <div>
                    <el-input-number
                        style="width: 100%"
                        v-model="option.nodeTag.digits"
                        :min="0"
                        :max="10"
                        :step="1"
                        step-strictly
                    />
                </div>
            </div>
        </el-form-item>
        <el-form-item>
            <el-checkbox v-model="option.elemTag.show">单元数值</el-checkbox
            ><el-button @click="viewResultTable('elem')">...</el-button>
            <div
                class="grid-Wrapper1"
                v-show="option.elemTag.show"
            >
                <div class="align-right">类别：</div>
                <div>
                    <el-select v-model="option.elemTag.key">
                        <el-option
                            label="请选择："
                            value=""
                            disabled
                        ></el-option>
                        <el-option
                            label="单元长度"
                            value="length"
                        ></el-option>
                        <el-option
                            label="单元力密度"
                            value="q"
                        ></el-option>
                        <el-option
                            label="单元预应力"
                            value="f"
                        ></el-option>
                    </el-select>
                </div>
                <div class="align-right">放大倍数：</div>
                <div>
                    <el-input-number
                        style="width: 100%"
                        v-model="option.elemTag.magnification"
                        :min="1"
                        :step="1"
                        step-strictly
                    />
                </div>
                <div class="align-right">精度：</div>
                <div>
                    <el-input-number
                        style="width: 100%"
                        v-model="option.elemTag.digits"
                        :min="0"
                        :max="10"
                        :step="1"
                        step-strictly
                    />
                </div>
            </div>
        </el-form-item>
        <el-form-item label="显示控制">
            <div class="grid-Wrapper2">
                <div style="flex: 1">
                    <el-checkbox v-model="option.contour.show"
                        >等值线</el-checkbox
                    >
                    <el-button size="small">...</el-button>
                </div>
                <div style="flex: 1">
                    <el-checkbox v-model="option.legend.show">图例</el-checkbox>
                    <el-button size="small">...</el-button>
                </div>
                <div style="flex: 1">
                    <el-checkbox v-model="option.shape.show"
                        >变形幅值</el-checkbox
                    >
                    <el-button size="small">...</el-button>
                </div>
            </div>
        </el-form-item>
    </el-form>
    <div class="dialog-submit-wrapper">
        <el-button
            type="primary"
            plain
            @click="viewResultSecne"
        >
            应用</el-button
        >
        <el-button
            type="primary"
            plain
            @click="status.ui.dialog.show = false"
            >关闭</el-button
        >
    </div>
</template>

<style scoped>
.select {
    flex: 1;
    padding-inline-start: 5px;
}
.flex-Wrapper {
    flex: 1;
    display: flex;
    justify-content: space-around;
}
.grid-Wrapper1 {
    display: grid;
    grid-template-columns: 70px 1fr;
    grid-column-gap: 5px;
}
.grid-Wrapper2 {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
}
.align-right {
    margin-left: auto;
}
.el-button {
    padding: 0;
    border: 0;
}
</style>
