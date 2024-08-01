<script setup>
import { ref, computed, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useView } from '../../../api/view/index'
import { Dim, NodeShape } from '../../../api/model/index'
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
    view.scene.metadata.useStatus().mesh.selected.node
).join(','))

const operation = ref({
    type: type.add,
    equality: NodeShape.EQUALITY.EQ,
    target: NodeShape.TYPE.SNODE.is,
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
    const points = stringToNumberArray(operation.value.nos).map(no => view.points.prep.find(point => point.mesh.metadata.no === no)).filter(item => item)
    const dim = (operation.value.dim.x ? Dim.X : Dim.NONE)
        | (operation.value.dim.y ? Dim.Y : Dim.NONE)
        | (operation.value.dim.z ? Dim.Z : Dim.NONE)
    Object.entries(operation.value.dim).forEach(([key, value]) => {
        if (!value) {
            operation.value.values[key] = 0
        }
    })
    if (operation.value.target === NodeShape.TYPE.SNODE.is) {
        operation.value.noPrm = 0
    }
    else {
        operation.value.valuesFromModel = false
    }
    let targetExist, no
    if ((operation.value.type == type.add || operation.value.type == type.replace) && dim != Dim.NONE) {
        points.forEach(point => {
            const node = point.mesh.metadata
            const nodeShape = model.target.nodeShape.find(shape => shape.group.no === operation.value.group
                && shape.equality === operation.value.equality
                && shape.type.is === operation.value.target
                && shape.nodeSlv === node)
            if (nodeShape) {
                nodeShape.dim = operation.value.type == type.add ? (nodeShape.dim | dim) : dim
                Object.entries(operation.value.dim).forEach(([key, value]) => {
                    if (value) {
                        nodeShape[key] = operation.value.target === NodeShape.TYPE.SNODE.is && operation.value.valuesFromModel
                            ? node[key] : operation.value.values[key]
                    }
                    else if (operation.value.type == type.replace) {
                        nodeShape[key] = 0.0
                    }
                })
                if (operation.value.target === NodeShape.TYPE.TNODEDIFF.is || operation.value.target === NodeShape.TYPE.TNODEDIVD.is) {
                    nodeShape.nodePrm = model.node.find(node => node.no === operation.value.noPrm)
                }
            }
            else {
                no = operation.value.start
                targetExist = model.target.nodeShape.map(target => target.no).filter(item => item >= no)
                while (true) {
                    const index = targetExist.findIndex(item => item == no)
                    if (index != -1) {
                        targetExist.splice(index, 1)
                        no += 1
                    }
                    else {
                        const { x, y, z } = operation.value.target === NodeShape.TYPE.SNODE.is && operation.value.valuesFromModel ? node : operation.value.values
                        model.createNodeShape([
                            no,
                            operation.value.group,
                            operation.value.equality,
                            operation.value.target,
                            dim,
                            node.no,
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
        points.forEach(point => {
            model.target.nodeShape.filter(shape =>
                (operation.value.group != -1 ? operation.value.group === shape.group.no : true)
                && (operation.value.equality != -1 ? operation.value.equality === shape.equality : true)
                && (operation.value.target != -1 ? operation.value.target === shape.type.is : true)
                && (point.mesh.metadata === shape.nodeSlv)
            ).forEach(shape => model.removeNodeShape(shape))
        })
    }
    view.scene.metadata.useStatus().mesh.selected.node.clear()
    view.scene.metadata.useStatus().mesh.selected.elem.clear()
}
</script>

<template>
    <Dialog title="节点几何目标" :width="250">
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
                                v-for="[key, value] of operation.type == type.remove ? Object.entries(NodeShape.EQUALITY).concat([['ALL', -1]]) : Object.entries(NodeShape.EQUALITY)"
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
                                v-for="type of operation.type == type.remove ? Object.values(NodeShape.TYPE).concat([{ is: -1, label: '全部', alias: '' }]) : Object.values(NodeShape.TYPE)"
                                :label="type.alias + ' ' + type.label" :value="type.is" :key="type.is"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item>
                        <el-text>节点</el-text>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item>
                        <el-input v-model="operation.nos" disabled />
                    </el-form-item>
                </el-col>
            </el-row>
            <template v-if="operation.type != type.remove">
                <el-row v-if="operation.target !== NodeShape.TYPE.SNODE.is && operation.type != type.remove">
                    <el-col :span="8">
                        <el-form-item>
                            <el-text>参照节点</el-text>
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item>
                            <el-input-number v-model.number="operation.noPrm" :min="1" :precision="0"/>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item v-if="operation.target === NodeShape.TYPE.SNODE.is">
                    <el-checkbox v-model="operation.valuesFromModel" label="采用节点初始坐标" />
                </el-form-item>
                <el-row v-for="key in Object.keys(operation.dim)">
                    <el-col :span="6">
                        <el-form-item>
                            <el-checkbox v-model="operation.dim[key]" :label="key" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="18">
                        <el-form-item>
                            <el-input v-model.number="operation.values[key]"
                                :disabled="!operation.dim[key] || (operation.target == NodeShape.TYPE.SNODE.is && operation.valuesFromModel)" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>
        </el-form>
    </Dialog>
</template>

<style scoped>
</style>
