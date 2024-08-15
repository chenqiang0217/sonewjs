<script setup>
import { Vector3 } from '@babylonjs/core'
import { ref, computed, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useView } from '../../../api/view/index'
import { stringToNumberArray, Validator } from '../../../api/utils'
import { ElemType } from '../../../api/model/index'
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
    eType: ElemType.FREE.no,
    femType: model.elemFemType.length > 0 ? model.elemFemType[0] : void 0,
    mat: model.elemMat.length > 0 ? model.elemMat[0] : void 0,
    sec: model.elemSec.length > 0 ? model.elemSec[0] : void 0,
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
    },
    check: {
        position: function () {
            const numberArray = stringToNumberArray(this)
            const validator = new Validator(numberArray)
            validator.addCondition(Validator.AllNumber)
            return numberArray.length == 3 && validator.validate()
        },
        noExist: function () {
            return model.elem.some(elem => elem.no === this)
        }
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

    if (operation.value.check.position.apply(value)) {
        callback()
    } else {
        callback(new Error('格式错误'))
    }
}
const validateElemExist = (_, value, callback) => {
    if (operation.value.check.noExist.apply(value)) {
        callback(new Error('单元已存在'))
    } else {
        callback()
    }
}
const validateNodeExist = (_, value, callback) => {
    if (operation.value.check.nodeExist.apply(value)) {
        callback()
    } else {
        callback(new Error('节点不存在'))
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
                        model.createElem([no, operation.value.eType, operation.value.femType.no, operation.value.mat, operation.value.sec.no, iNode, jNode])
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
                if (operation.value.modify.no && index == 0) {
                    elem.no = operation.value.noNew
                }
                if (operation.value.modify.eType) {
                    elem.eType = model.elemType.find(item => item.no == operation.value.eType)
                }
                if (operation.value.modify.femType) {
                    elem.femType = model.elemFemType.find(item => item.no == operation.value.femType)
                }
                if (operation.value.modify.mat) {
                    elem.mat = model.elemMat.find(item => item.no == operation.value.mat)
                }
                if (operation.value.modify.sec) {
                    elem.sec = model.elemSec.find(item => item.no == operation.value.sec)
                }
                if (operation.value.modify.ijNode) {
                    [elem.iNode, elem.jNode] = [elem.jNode, elem.iNode]
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
                        <el-radio :value="ElemType.FREE.no">自由</el-radio>
                        <el-radio :value="ElemType.LOCK.no">锁定</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item prop="start">
                    <el-col :span="8"><el-text>起始编号：</el-text></el-col>
                    <el-col :span="16"><el-input-number v-model="operation.start" :min="1" :precision="0" /></el-col>
                </el-form-item>
                <el-form-item>
                    <el-col :span="8"><el-text>类型：</el-text></el-col>
                    <el-col :span="16">
                        <el-select v-model="operation.femType">
                            <el-option v-for="(femType, index) of model.elemFemType" :label="femType.label"
                                :value="femType.no" :key="index"></el-option>
                        </el-select>
                    </el-col>
                </el-form-item>
                <el-form-item>
                    <el-col :span="8"><el-text>材料：</el-text></el-col>
                    <el-col :span="16">
                        <el-select v-model="operation.mat">
                            <el-option v-for="(mat, index) of model.elemMat" :label="mat.label" :value="mat.no"
                                :key="index"></el-option>
                        </el-select>
                    </el-col>
                </el-form-item>
                <el-form-item>
                    <el-col :span="8"><el-text>截面：</el-text></el-col>
                    <el-col :span="16">
                        <el-select v-model="operation.sec">
                            <el-option v-for="(sec, index) of model.elemSec" :label="sec.label" :value="sec.no"
                                :key="index"></el-option>
                        </el-select>
                    </el-col>
                </el-form-item>
                <el-form-item label="选择节点">
                    <el-input v-model="operation.ijNode" disabled/>
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
                    <el-col :span="16"><el-input-number v-model="operation.start" :min="1" :precision="0"
                            :disabled="operation.copy.move" /></el-col>
                </el-form-item>
                <el-form-item>
                    <el-col :span="8"><el-text>复制次数：</el-text></el-col>
                    <el-col :span="16"><el-input-number v-model="operation.copy.times" :min="1" :precision="0"
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
                    <el-col :span="8">
                        <el-form-item>
                            <el-checkbox v-model="operation.modify.no" label="编号" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item prop="noNew">
                            <el-input-number v-model="operation.noNew" :min="1" :disabled="!operation.modify.no"
                                :precision="0" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item>
                            <el-checkbox v-model="operation.modify.eType" label="类型" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item>
                            <el-select v-model="operation.eType" :disabled="!operation.modify.eType" >
                                <el-option v-for="(type, index) of model.elemType" :label="type.label=='free'?'自由':'锁定'"
                                    :value="type.no" :key="index"></el-option>
                            </el-select>
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
                        <el-form-item>
                            <el-select v-model="operation.femType" :disabled="!operation.modify.femType" >
                                <el-option v-for="(femType, index) of model.elemFemType" :label="femType.label"
                                    :value="femType.no" :key="index"></el-option>
                            </el-select>
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
                        <el-form-item>
                            <el-select v-model="operation.mat" :disabled="!operation.modify.mat">
                                <el-option v-for="(mat, index) of model.elemMat" :label="mat.label" :value="mat.no"
                                    :key="index"></el-option>
                            </el-select>
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
                        <el-form-item>
                            <el-select v-model="operation.sec" :disabled="!operation.modify.sec">
                                <el-option v-for="(sec, index) of model.elemSec" :label="sec.label" :value="sec.no"
                                    :key="index"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item>
                            <el-checkbox v-model="operation.modify.ijNode" label="节点反转" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>
        </el-form>
    </Dialog>
</template>

<style scoped>
.el-input-number{
    width: 100%;
}
</style>
