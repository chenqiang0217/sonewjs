<script setup>
import { ref, computed, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useView } from '../../../api/view/index'
import { Dim, ElemForce } from '../../../api/model/index'
import { stringToNumberArray } from '../../../api/utils'

const model = useModelStore()
const status = useStatusStore()
const view = useView()
const type = {
    add: 1,
    remove: 3
}
const targetLabel = {
    SDENSITY: '力密度',
    TDENSITYDIFF: '力密度差值',
    TDENSITYDIVD: '力密度比值',
    SFORCE1: '单元力，以力密度为未知数',
    TFORCEDIVD1: '单元力比值，以力密度为未知数',
    SFORCE2: '单元力，以节点坐标为未知数',
    TFORCEDIVD2: '单元力比值，以节点坐标为未知数',
    ALL: '全部'
}
const nos = computed(() => Array.from(
    view.scene.metadata.useStatus().mesh.selected.elem
).join(','))
const operation = ref({
    type: type.add,
    equality: ElemForce.EQUALITY.EQ,
    target: ElemForce.TYPE.SDENSITY,
    nos,
    noPrm: null,
    start: 1,
    group: model.target.group[0].no,
    dim: {
        x: false,
        y: false,
        z: false
    },
    values: {
        x: 0
    }
})
const options = ref([
    {
        label: '添加、替换',
        value: type.add,
    },
    {
        label: '删除',
        value: type.remove,
    }
])
watch(
    () => status.ui.dialog.apply,
    apply => {
        if (apply) {
            status.ui.dialog.apply = false
            onApply()
        }
    }
)
function onApply() {
    const lines = stringToNumberArray(operation.value.nos).map(no => view.lines.prep.find(line => line.mesh.metadata.no === no)).filter(item => item)
    let dim = (operation.value.dim.x ? Dim.X : Dim.NONE)
        | (operation.value.dim.y ? Dim.Y : Dim.NONE)
        | (operation.value.dim.z ? Dim.Z : Dim.NONE)
    if ([ElemForce.TYPE.SDENSITY, ElemForce.TYPE.TDENSITYDIFF, ElemForce.TYPE.TDENSITYDIVD]
        .includes(operation.value.target)) {
        dim = Dim.NONE
    }
    if ([ElemForce.TYPE.SDENSITY, ElemForce.TYPE.SFORCE1, ElemForce.TYPE.SFORCE2]
        .includes(operation.value.target)) {
        operation.value.noPrm = 0
    }
    let targetExist, no
    if ((operation.value.type == type.add)) {
        lines.forEach(line => {
            const elem = line.mesh.metadata
            const elemForce = model.target.elemForce.find(force => force.group.no === operation.value.group
                && force.equality === operation.value.equality
                && force.type === operation.value.target
                && force.elemSlv === elem)
            if (elemForce) {
                elemForce.dim = dim
                elemForce.val = operation.value.values.x
                if ([ElemForce.TYPE.TDENSITYDIFF, ElemForce.TYPE.TDENSITYDIVD, ElemForce.TYPE.TFORCEDIVD1, ElemForce.TYPE.TFORCEDIVD2]
                    .includes(operation.value.target)) {
                    elemForce.elemPrm = model.elem.find(elem => elem.no === operation.value.noPrm)
                }
            }
            else {
                no = operation.value.start
                targetExist = model.target.elemForce.map(target => target.no).filter(item => item >= no)
                while (true) {
                    const index = targetExist.findIndex(item => item == no)
                    if (index != -1) {
                        targetExist.splice(index, 1)
                        no += 1
                    }
                    else {
                        model.createElemForce([
                            no,
                            operation.value.group,
                            operation.value.equality,
                            operation.value.target,
                            dim,
                            operation.value.noPrm,
                            elem.no,
                            operation.value.values.x
                        ])
                        no += 1
                        break
                    }
                }
            }
        })
    }
    else if (operation.value.type == type.remove) {
        lines.forEach(line => {
            model.target.elemForce.filter(force =>
                (operation.value.group != -1 ? operation.value.group === force.group.no : true)
                && (operation.value.equality != -1 ? operation.value.equality === force.equality : true)
                && (operation.value.target != -1 ? operation.value.target === force.type : true)
                && (line.mesh.metadata === force.elemSlv)
            ).forEach(force => model.removeElemForce(force))
        })
    }
    view.scene.metadata.useStatus().mesh.selected.node.clear()
    view.scene.metadata.useStatus().mesh.selected.elem.clear()
}
</script>

<template>
    <el-form :model="operation" label-position="top" status-icon>
        <el-form-item>
            <el-radio-group v-model="operation.type">
                <el-radio v-for="{ value, label } in options" :value="value">{{ label }}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-row>
            <el-col :span="8">
                <el-form-item>
                    <el-text>目标分组</el-text>
                </el-form-item>
            </el-col>
            <el-col :span="16">
                <el-form-item>
                    <el-select v-model="operation.group">
                        <el-option
                            v-for="{ no, label } of operation.type == type.remove ? model.target.group.concat([{ no: -1, label: '全部' }]) : model.target.group"
                            :label="label" :value="no" :key="no"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="8">
                <el-form-item>
                    <el-text>等式类型</el-text>
                </el-form-item>
            </el-col>
            <el-col :span="16">
                <el-form-item>
                    <el-select v-model="operation.equality">
                        <el-option
                            v-for="[key, value] of operation.type == type.remove ? Object.entries(ElemForce.EQUALITY).concat([['所有', -1]]) : Object.entries(ElemForce.EQUALITY)"
                            :label="key == 'EQ' ? '等于' : key == 'GT' ? '大于' : key == 'LT' ? '小于' : '全部'" :value="value"
                            :key="value"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="8">
                <el-form-item>
                    <el-text>目标类型</el-text>
                </el-form-item>
            </el-col>
            <el-col :span="16">
                <el-form-item>
                    <el-select v-model="operation.target">
                        <el-option
                            v-for="[key, value] of operation.type == type.remove ? Object.entries(ElemForce.TYPE).concat([['ALL', -1]]) : Object.entries(ElemForce.TYPE)"
                            :label="targetLabel[key]" :value="value" :key="value"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="8">
                <el-form-item>
                    <el-text>单元</el-text>
                </el-form-item>
            </el-col>
            <el-col :span="16">
                <el-form-item>
                    <el-input v-model="operation.nos" disabled />
                </el-form-item>
            </el-col>
        </el-row>
        <template v-if="operation.type != type.remove">
            <el-row v-if="[ElemForce.TYPE.TDENSITYDIFF, ElemForce.TYPE.TDENSITYDIVD, ElemForce.TYPE.TFORCEDIVD1, ElemForce.TYPE.TFORCEDIVD2]
                .includes(operation.target) && operation.type != type.remove">
                <el-col :span="8">
                    <el-form-item>
                        <el-text>参照单元</el-text>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item>
                        <el-input-number v-model.number="operation.noPrm" :min="1" />
                    </el-form-item>
                </el-col>
            </el-row>
            <template
                v-if="[ElemForce.TYPE.SDENSITY, ElemForce.TYPE.TDENSITYDIFF, ElemForce.TYPE.TDENSITYDIVD].includes(operation.target)">
                <el-row>
                    <el-col :span="8">
                        <el-form-item>
                            <el-text>数值</el-text>
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item>
                            <el-input v-model.number="operation.values.x" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>
            <template v-else-if="[ElemForce.TYPE.SFORCE1, ElemForce.TYPE.TFORCEDIVD1, ElemForce.TYPE.SFORCE2, ElemForce.TYPE.TFORCEDIVD2]
                .includes(operation.target)">
                <el-row>
                    <el-col :span="4" v-for="key in Object.keys(operation.dim)">
                        <el-form-item>
                            <el-checkbox v-model="operation.dim[key]" :label="key" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item>
                            <el-input v-model.number="operation.values.x" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>
        </template>
    </el-form>
</template>

<style scoped>

</style>
