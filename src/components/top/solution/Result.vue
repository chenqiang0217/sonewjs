<script setup>
import { ref, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useView } from '../../../api/view/index'
import { CONSTANT } from '../../../stores/constant'

const model = useModelStore()
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
watch(() => option.value.elemTag.show, show => {
    if(show === false){
        option.value.contour.show = false
    }
})

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
watch(
    () => status.ui.dialog.apply,
    (apply) => {
        if(apply){
            status.ui.dialog.apply = false
            viewResultSecne()
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
    const view = useView()
    const result = model.result.find(res => res.step == step)
    const nodes = result.node
    nodes.forEach(node => 
        view.points.rslt.find(point => point.mesh.metadata.no == node.no).position = node.position
    )
    view.lines.rslt.forEach(line => line.updatePosition())
    //text内容
    if (option.value.nodeTag.show) {
        view.control.hideText('node', 'prep')
        const key = option.value.nodeTag.key
        const digits = option.value.nodeTag.digits

        view.points.rslt.forEach(point => {
            point.text =  point.mesh.metadata[key].toFixed(digits)
        })
        view.control.showText('node', 'rslt')
    } else {
        view.control.hideText('node', 'all')
    }
    if (option.value.elemTag.show) {
        view.control.hideText('elem', 'prep')
        const config = view.scene.metadata.useConfig()
        const key = option.value.elemTag.key
        const magnification = option.value.elemTag.magnification
        const digits = option.value.elemTag.digits
        config.mesh.elem.color.rslt.contour.by = key
        const nSec = config.mesh.elem.color.rslt.contour.nSec
        const elems = result.elem
        const {min, max} = result.summarized.elem[key]
        const colors = config.contour
        view.lines.rslt.forEach(line => {
            const v = elems.find(elem => elem.no == line.no)[key]
            line.text = (v * magnification).toFixed(digits)
            if (option.value.contour.show) {
                let i = Math.round(
                    (v - min) / (max - min) * (nSec - 1)
                )
                line.updateMeshColor(colors[i])
            }
            else {
                line.updateMeshColor()
            }
        })
        view.control.showText('elem', 'rslt')
    } else {
        view.control.hideText('elem', 'all')
        view.lines.rslt.forEach(line => {
            line.updateMeshColor()
        })
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
                        <!-- l,q,f为model.result.elem对应key -->
                        <el-option
                            label="请选择："
                            value=""
                            disabled
                        ></el-option>
                        <el-option
                            label="单元长度"
                            value="l"
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
                    <el-checkbox v-model="option.contour.show" :disabled="!option.elemTag.show"
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
