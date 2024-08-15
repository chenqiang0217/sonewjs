<script setup>
import { ref, computed, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useView } from '../../../api/view/index'
import { Dim, ElemShape } from '../../../api/model/index'
import { stringToNumberArray } from '../../../api/utils'
import Dialog from '../Dialog.vue'

const model = useModelStore()
const status = useStatusStore()
const view = useView()
const type = {
    add: 1,
    replace: 2,
    remove: 3
}
const nos = computed(() => Array.from(
    view.scene.metadata.useStatus().mesh.selected.elem
).join(','))

const operation = ref({
    type: type.add,
    equality: ElemShape.EQUALITY.EQ,
    target: ElemShape.TYPE.SELEM.is,
    nos,
    noPrm: null,
    start: 1,
    group: model.target.group[0]?.no,
    valuesFromModel: true,
    dim: {
        x: false,
        y: false,
        z: false
    },
    values: {
        x: 0,
        y: 0,
        z: 0
    }
})
const options = ref([
    {
        label: '添加',
        value: type.add,
    },
    {
        label: '替换',
        value: type.replace,
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
    const dim = (operation.value.dim.x ? Dim.X : Dim.NONE)
        | (operation.value.dim.y ? Dim.Y : Dim.NONE)
        | (operation.value.dim.z ? Dim.Z : Dim.NONE)
    Object.entries(operation.value.dim).forEach(([key, value]) => {
        if (!value) {
            operation.value.values[key] = 0
        }
    })
    if (operation.value.target == ElemShape.TYPE.TELEMDIVD.is) {
        operation.value.valuesFromModel = false
    }
    else {
        operation.value.noPrm = 0
    }
    let targetExist, no
    if ((operation.value.type == type.add || operation.value.type == type.replace) && dim != Dim.NONE) {
        lines.forEach(line => {
            const elem = line.mesh.metadata
            const vector = elem.jNode.position.subtract(elem.iNode.position)
            let { x, y, z } = operation.value.target == ElemShape.TYPE.SELEM.is && operation.value.valuesFromModel ? vector : operation.value.values
            if (operation.value.target == ElemShape.TYPE.SELEML.is || operation.value.target == ElemShape.TYPE.TELEMDIVD.is) {
                x = operation.value.valuesFromModel ? Math.sqrt(
                    operation.value.dim.x ? vector.x ** 2 : 0
                        + operation.value.dim.y ? vector.y ** 2 : 0
                            + operation.value.dim.z ? vector.z ** 2 : 0
                ) : operation.value.values.x
                y = 0.0
                z = 0.0
            }
            const vals = { x, y, z }
            const elemShape = model.target.elemShape.find(shape => shape.group.no === operation.value.group
                && shape.equality === operation.value.equality
                && shape.type.is === operation.value.target
                && shape.elemSlv === elem)
            if (elemShape) {
                if (operation.value.target == ElemShape.TYPE.SELEM.is) {
                    elemShape.dim = operation.value.type == type.add ? (elemShape.dim | dim) : dim
                    Object.entries(operation.value.dim).forEach(([key, value]) => {
                        if (value) {
                            elemShape[key] = vals[key]
                        }
                        else if (operation.value.type == type.replace) {
                            elemShape[key] = 0.0
                        }
                    })
                }
                else {
                    elemShape.dim = dim
                    elemShape.x = x
                    elemShape.y = y
                    elemShape.z = z
                }
                if (operation.value.target == ElemShape.TYPE.TELEMDIVD.is) {
                    elemShape.elemPrm = model.elem.find(elem => elem.no === operation.value.noPrm)
                }
            }
            else {
                no = operation.value.start
                targetExist = model.target.elemShape.map(target => target.no).filter(item => item >= no)
                while (true) {
                    const index = targetExist.findIndex(item => item == no)
                    if (index != -1) {
                        targetExist.splice(index, 1)
                        no += 1
                    }
                    else {
                        model.createElemShape([
                            no,
                            operation.value.group,
                            operation.value.equality,
                            operation.value.target,
                            dim,
                            elem.no,
                            operation.value.noPrm,
                            x, y, z
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
            model.target.elemShape.filter(shape =>
                (operation.value.group != -1 ? operation.value.group === shape.group.no : true)
                && (operation.value.equality != -1 ? operation.value.equality === shape.equality : true)
                && (operation.value.target != -1 ? operation.value.target === shape.type.is : true)
                && (line.mesh.metadata === shape.elemSlv)
            ).forEach(shape => model.removeElemShape(shape))
        })
    }
    view.scene.metadata.useStatus().mesh.selected.node.clear()
    view.scene.metadata.useStatus().mesh.selected.elem.clear()
}
</script>

<template>
    <Dialog title="单元几何目标" :width="250">
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
                        <el-select v-model="operation.group" placeholder="">
                            <el-option
                                v-for="{ no, label } of operation.type == type.remove ? model.target.group.concat([{ no: -1, label: '全部' }]) : model.target.group"
                                :label="label" :value="no" :key="no"></el-option>
                            <template #empty>
                                <el-text>未定义</el-text>
                            </template>
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
                                v-for="[key, value] of operation.type == type.remove ? Object.entries(ElemShape.EQUALITY).concat([['所有', -1]]) : Object.entries(ElemShape.EQUALITY)"
                                :label="key == 'EQ' ? '等于' : key == 'GT' ? '大于' : key == 'LT' ? '小于' : '全部'"
                                :value="value" :key="value"></el-option>
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
                                v-for="type of operation.type == type.remove ? Object.values(ElemShape.TYPE).concat([{ is: -1, label: '全部', alias: '' }]) : Object.values(ElemShape.TYPE)"
                                :label="type.alias + ' ' + type.label" :value="type.is" :key="type.is"></el-option>
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
            <el-row v-if="operation.target == ElemShape.TYPE.TELEMDIVD.is && operation.type != type.remove">
                <el-col :span="8">
                    <el-form-item>
                        <el-text>参照单元</el-text>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item>
                        <el-input-number v-model.number="operation.noPrm" :min="1" :precision="0"/>
                    </el-form-item>
                </el-col>
            </el-row>
            <template v-if="operation.type != type.remove">
                <el-form-item v-if="operation.target != ElemShape.TYPE.TELEMDIVD.is">
                    <el-checkbox v-model="operation.valuesFromModel" label="采用节点初始坐标" />
                </el-form-item>
                <template v-if="operation.target == ElemShape.TYPE.SELEM.is">
                    <el-row v-for="key in Object.keys(operation.dim)">
                        <el-col :span="6">
                            <el-form-item>
                                <el-checkbox v-model="operation.dim[key]" :label="key" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="18">
                            <el-form-item>
                                <el-input v-model="operation.values[key]"
                                    :disabled="!operation.dim[key] || operation.valuesFromModel" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </template>
                <template v-else>
                    <el-row>
                        <el-col :span="4" v-for="key in Object.keys(operation.dim)">
                            <el-form-item>
                                <el-checkbox v-model="operation.dim[key]" :label="key" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item>
                                <el-input v-model="operation.values.x" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </template>
            </template>
        </el-form>
    </Dialog>
</template>

<style scoped>
</style>
