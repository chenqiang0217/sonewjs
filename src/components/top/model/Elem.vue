<script setup>
import { Vector3 } from '@babylonjs/core'
import { ref, computed, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useView } from '../../../api/view/index'
import { stringToNumberArray, Validator } from '../../../api/utils'
import { Elem } from '../../../api/model/index'
import Dialog from '../Dialog.vue'

const model = useModelStore()
const status = useStatusStore()
const view = useView()
const type = {
    create: 1,
    copy: 2,
    remove: 3,
    modify: 4,
    elem: {
        selected: 1,
        keyin: 2
    }
}

const nos = computed(() => Array.from(
    view.scene.metadata.useStatus().mesh.selected.elem
).join(','))
const ijNode = computed(() => Array.from(
    view.scene.metadata.useStatus().mesh.selected.node
).join(','))

const operation = ref({
    type: type.create,
    gap: '0,0,0',
    nos,
    start: model.maxNo.elem + 1,
    noNew: model.maxNo.elem + 1,
    eType: Elem.ETYPE.FREE,
    femType: 1,
    mat: 1,
    sec: 1,
    ijNode,
    create: {
    },
    copy: {
        times: 0,
    },
    remove: {
        from: type.elem.selected,
        onlyIsolated: true
    },
    modify: {
        no: false,
        eType: false,
        femType: false,
        mat: false,
        sec: false,
        ijNode: false,
    }
})
const options = ref([
    {
        label: '创建',
        value: type.create,
    },
    {
        label: '复制',
        value: type.copy,
    },
    {
        label: '删除',
        value: type.remove,
    },
    {
        label: '修改',
        value: type.modify,
    }
])
const validatePosition = (_, value, callback) => {
    const numberArray = stringToNumberArray(value)
    const validator = new Validator(numberArray)
    validator
        .addCondition(Validator.AllNumber)
    if (numberArray.length == 3 && validator.validate()) {
        callback()
    } else {
        callback(new Error('格式错误'))
    }
}
const validateElemExist = (_, value, callback) => {
    if (model.elem.find(elem => elem.no == value)) {
        callback(new Error('单元已存在'))
    } else {
        callback()
    }
}
// rules对应键名必须和el-form-item里的prop、model对应键名一致
const rules = ref({
    gap: [{ validator: validatePosition, trigger: 'blur' }],
    noNew: [{ validator: validateElemExist, trigger: 'change' }],
})
watch(
    () => status.ui.dialog.apply,
    (apply) => {
        if (apply) {
            status.ui.dialog.apply = false
            onApply()
        }
    }
)
function onApply() {
    const lines = stringToNumberArray(operation.value.nos).map(no => view.lines.prep.find(line => line.mesh.metadata.no === no)).filter(item => item)
    let elemExist, no = operation.value.start
    switch (operation.value.type) {
        case type.create:
            elemExist = model.elem.map(elem => elem.no).filter(item => item >= no)
            const ijNode = stringToNumberArray(operation.value.ijNode).map((_, index, arr) =>
                index < (arr.length - 1) ? { iNode: arr[index], jNode: arr[index + 1] } : []
            )
            ijNode.pop()
            ijNode.forEach(({ iNode, jNode }) => {
                while (true) {
                    const index = elemExist.findIndex(item => item == no)
                    if (index != -1) {
                        elemExist.splice(index, 1)
                        no += 1
                        continue
                    }
                    else {
                        model.createElem([no, operation.value.eType, operation.value.femType, operation.value.mat, operation.value.sec, iNode, jNode])
                        no += 1
                        break
                    }
                }
            })
            break
        case type.copy:
            const gap = new Vector3(...stringToNumberArray(operation.value.gap))
            const times = operation.value.copy.times
            elemExist = model.elem.map(elem => elem.no).filter(item => item >= no)
            let nodeNo = model.maxNo.node
            //创建节点
            const nodeNos = lines.map(line => [line.mesh.metadata.iNode.no, line.mesh.metadata.jNode.no])
                .flat()
                .filter((value, index, array) => array.indexOf(value) == index)
                .map(item => [item])
            for (let i = 0; i < times; i++) {
                nodeNos.forEach(item => {
                    nodeNo += 1
                    const position = model.node.find(node => node.no == item[0]).position.add(gap.scale(i + 1)).asArray()
                    model.createNode([nodeNo, ...position])
                    item.push(nodeNo)
                })
            }
            for (let i = 0; i < times; i++) {
                let j = 0
                while (j < lines.length) {
                    const index = elemExist.findIndex(item => item == no)
                    if (index != -1) {
                        elemExist.splice(index, 1)
                        no += 1
                        continue
                    }
                    else {
                        const elem = lines[j].mesh.metadata
                        const iNode = elem.iNode.no
                        const jNode = elem.jNode.no
                        const elemArray = elem.asArray()
                        elemArray.splice(0, 1, no)
                        elemArray.splice(-2, 2, nodeNos.find(item => item[0] == iNode)[i + 1], nodeNos.find(item => item[0] == jNode)[i + 1])
                        model.createElem(elemArray)
                        no += 1
                        j += 1
                    }
                }
            }
            break
        case type.remove:
            lines.forEach(line => {
                const elem = line.mesh.metadata
                const inElemShape = model.target.elemShape.find(elemShape => elemShape.elemPrm === elem || elemShape.elemSlv === elem)
                const inElemForce = model.target.elemForce.find(elemForce => elemForce.elemPrm === elem || elemForce.elemSlv === elem)
                if (!operation.value.remove.onlyIsolated || (operation.value.remove.onlyIsolated && !(inElemShape || inElemForce))) {
                    model.removeElem(elem)
                }
            })
            break
        case type.modify:
            lines.forEach((line, index) => {
                const elem = line.mesh.metadata
                if (operation.value.modify.eType) {
                    elem.eType = elem.eType === Elem.ETYPE.FREE ? Elem.ETYPE.LOCK : Elem.ETYPE.FREE
                }
                if (operation.value.modify.ijNode) {
                    [elem.iNode, elem.jNode] = [elem.jNode, elem.iNode]
                }
                if (operation.value.modify.no && index == 0) {
                    elem.no = operation.value.noNew
                }
                if (operation.value.modify.femType) {
                    elem.femType = operation.value.femType
                }
                if (operation.value.modify.mat) {
                    elem.mat = operation.value.mat
                }
                if (operation.value.modify.sec) {
                    elem.sec = operation.value.sec
                }
            })
            break
    }
    view.scene.metadata.useStatus().mesh.selected.node.clear()
    view.scene.metadata.useStatus().mesh.selected.elem.clear()
}
</script>

<template>
    <Dialog title="单元" :width="250">
        <el-form :model="operation" label-position="top" status-icon :rules="rules">
            <el-form-item>
                <el-select v-model="operation.type" placeholder="选择类型">
                    <el-option v-for="{ value, label } in options" :label="label" :value="value"
                        :key="value"></el-option>
                </el-select>
            </el-form-item>
            <template v-if="operation.type == type.create">
                <el-form-item>
                    <el-radio-group v-model="operation.eType">
                        <el-radio :value="Elem.ETYPE.FREE">自由</el-radio>
                        <el-radio :value="Elem.ETYPE.LOCK">锁定</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item prop="start">
                    <el-col :span="8"><el-text>起始编号：</el-text></el-col>
                    <el-col :span="16"><el-input-number v-model="operation.start" :min="1" /></el-col>
                </el-form-item>
                <el-form-item prop="femType">
                    <el-col :span="8"><el-text>类型：</el-text></el-col>
                    <el-col :span="16"><el-input-number v-model="operation.femType" :min="1" /></el-col>
                </el-form-item>
                <el-form-item prop="mat">
                    <el-col :span="8"><el-text>材料：</el-text></el-col>
                    <el-col :span="16"><el-input-number v-model="operation.mat" :min="1" /></el-col>
                </el-form-item>
                <el-form-item prop="sec">
                    <el-col :span="8"><el-text>截面：</el-text></el-col>
                    <el-col :span="16"><el-input-number v-model="operation.sec" :min="1" /></el-col>
                </el-form-item>
                <el-form-item label="选择节点">
                    <el-input v-model="operation.ijNode" />
                </el-form-item>
            </template>
            <template v-if="operation.type == type.copy">
                <el-form-item label="选择单元">
                    <el-input v-model="operation.nos" disabled />
                </el-form-item>
                <el-form-item prop="gap">
                    <el-col :span="8"><el-text>间距：</el-text></el-col>
                    <el-col :span="16"><el-input v-model="operation.gap" /></el-col>
                </el-form-item>
                <el-form-item>
                    <el-col :span="8"><el-text>起始编号：</el-text></el-col>
                    <el-col :span="16"><el-input-number v-model="operation.start" :min="1"
                            :disabled="operation.copy.move" /></el-col>
                </el-form-item>
                <el-form-item>
                    <el-col :span="8"><el-text>复制次数：</el-text></el-col>
                    <el-col :span="16"><el-input-number v-model="operation.copy.times" :min="1"
                            :disabled="operation.copy.move" /></el-col>
                </el-form-item>
            </template>
            <template v-if="operation.type == type.remove">
                <el-form-item label="选择单元">
                    <el-input v-model="operation.nos" disabled />
                </el-form-item>
                <el-form-item>
                    <el-checkbox v-model="operation.remove.onlyIsolated" label="仅孤立单元" disabled />
                </el-form-item>
            </template>
            <template v-if="operation.type == type.modify">
                <el-form-item label="选择单元">
                    <el-input v-model="operation.nos" disabled />
                </el-form-item>
                <el-row>
                    <el-col :span="14">
                        <el-form-item>
                            <el-checkbox v-model="operation.modify.eType" label="锁定、自由切换" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item>
                            <el-checkbox v-model="operation.modify.ijNode" label="节点反转" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item>
                            <el-checkbox v-model="operation.modify.no" label="编号" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item prop="noNew">
                            <el-input-number v-model="operation.noNew" :min="1" :disabled="!operation.modify.no" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item>
                            <el-checkbox v-model="operation.modify.femType" label="类型" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item prop="femType">
                            <el-input-number v-model="operation.femType" :min="1"
                                :disabled="!operation.modify.femType" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item>
                            <el-checkbox v-model="operation.modify.mat" label="材料" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item prop="mat">
                            <el-input-number v-model="operation.mat" :min="1" :disabled="!operation.modify.mat" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item>
                            <el-checkbox v-model="operation.modify.sec" label="截面" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item prop="sec">
                            <el-input-number v-model="operation.sec" :min="1" :disabled="!operation.modify.sec" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>
        </el-form>
    </Dialog>
</template>

<style scoped></style>
