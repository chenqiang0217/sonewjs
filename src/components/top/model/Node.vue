<script setup>
import { Vector3 } from '@babylonjs/core'
import { ref, computed, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useView } from '../../../api/view/index'
import { stringToNumberArray, Validator } from '../../../api/utils'
import Dialog from '../Dialog.vue'


const model = useModelStore()
const status = useStatusStore()
const view = useView()
const type = {
    create: 1,
    copy: 2,
    remove: 3,
    rename: 4,
    node: {
        selected: 1,
        keyin: 2
    }
}

const nos = computed(() => Array.from(
    view.scene.metadata.useStatus().mesh.selected.node
).join(','))

const operation = ref({
    type: type.create,
    position: '0,0,0',
    gap: '0,0,0',
    nos,
    start: model.maxNo.node + 1,
    noNew: model.maxNo.node + 1,
    create: {
        times: 0,
    },
    copy: {
        move: true,
        times: 0,
    },
    remove: {
        from: type.node.selected,
        onlyIsolated: true
    },
    rename: {
    },
    check: {
        position: function () {
            const numberArray = stringToNumberArray(this)
            const validator = new Validator(numberArray)
            validator.addCondition(Validator.AllNumber)
            return numberArray.length == 3 && validator.validate()
        },
        singleNo: function () {
            return this !== '' && stringToNumberArray(this).length == 1
        },
        noExist: function () {
            return model.node.some(node => node.no === this)
        }
    }
})
const options = ref([
    {
        label: '创建',
        value: type.create,
    },
    {
        label: '复制、移动',
        value: type.copy,
    },
    {
        label: '删除',
        value: type.remove,
    },
    {
        label: '修改编号',
        value: type.rename,
    }
])

const validatePosition = (_, value, callback) => {
    if (operation.value.check.position.apply(value)) {
        callback()
    } else {
        callback(new Error('格式错误'))
    }
}
const validateNodeNotExist = (_, value, callback) => {
    if (operation.value.check.noExist.apply(value)) {
        callback(new Error('节点存在'))
    } else {
        callback()
    }
}
const validateSingleNo = (_, value, callback) => {
    if (operation.value.type !== type.rename || operation.value.check.singleNo.apply(value)) {
        callback()
    } else {
        callback(new Error('选择单个节点'))
    }
}
// rules对应键名必须和el-form-item里的prop、model对应键名一致
const rules = ref({
    position: [{ validator: validatePosition, trigger: 'blur' }],
    gap: [{ validator: validatePosition, trigger: 'blur' }],
    noNew: [{ validator: validateNodeNotExist, trigger: 'change' }],
    nos: [{ validator: validateSingleNo, trigger: 'change' }]
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
    let gap = new Vector3(...[0, 0, 0])
    const points = stringToNumberArray(operation.value.nos).map(no => view.points.prep.find(point => point.mesh.metadata.no === no)).filter(item => item)
    let nodeExist, no = operation.value.start
    switch (operation.value.type) {
        case type.create:
            if (!operation.value.check.position.apply(operation.value.position)) {
                return
            }
            const position = new Vector3(...stringToNumberArray(operation.value.position))
            const times = operation.value.create.times
            nodeExist = model.node.map(node => node.no).filter(item => item >= no)
            if (times > 0) {
                if (!operation.value.check.position.apply(operation.value.gap)) {
                    return
                }
                gap = new Vector3(...stringToNumberArray(operation.value.gap))
            }
            let i = 0
            while (i <= times) {
                const index = nodeExist.findIndex(item => item === no)
                if (index != -1) {
                    nodeExist.splice(index, 1)
                    no += 1
                    continue
                }
                else {
                    model.createNode([no, ...position.add(gap.scale(i)).asArray()])
                    no += 1
                    i += 1
                }
            }
            break
        case type.copy:
            if (!operation.value.check.position.apply(operation.value.gap)) {
                return
            }
            gap = new Vector3(...stringToNumberArray(operation.value.gap))
            if (operation.value.copy.move) {
                points.forEach(point => point.position = point.position.add(gap))
            }
            else {
                const times = operation.value.copy.times
                let i = 0, j
                nodeExist = model.node.map(node => node.no).filter(item => item >= no)
                while (i < times) {
                    j = 0
                    while (j < points.length) {
                        const index = nodeExist.findIndex(item => item == no)
                        if (index != -1) {
                            nodeExist.splice(index, 1)
                            no += 1
                            continue
                        }
                        else {
                            const node = points[j].mesh.metadata
                            model.createNode([no, ...node.position.add(gap.scale(i + 1)).asArray()])
                            no += 1
                            j += 1
                        }
                    }
                    i += 1
                }
            }
            break
        case type.remove:
            points.forEach(point => {
                const node = point.mesh.metadata
                const inElem = model.elem.find(elem => elem.iNode === node || elem.jNode === node)
                const inCnst = model.cnst.find(cnst => cnst.node === node)
                const inNodeShape = model.target.nodeShape.find(nodeShape => nodeShape.nodePrm === node || nodeShape.nodeSlv === node)
                if (!operation.value.remove.onlyIsolated || (operation.value.remove.onlyIsolated && !(inElem || inCnst || inNodeShape))) {
                    model.removeNode(node)
                }
            })
            break
        case type.rename:
        if (!operation.value.check.singleNo.apply(operation.value.nos)) {
                return
            }
            const point = points.shift()
            point.mesh.metadata.no = operation.value.noNew
            break
    }
    view.scene.metadata.useStatus().mesh.selected.node.clear()
    view.scene.metadata.useStatus().mesh.selected.elem.clear()
}
</script>

<template>
    <Dialog title="节点" :width="250">
        <el-form :model="operation" label-position="top" status-icon :rules="rules">
            <el-form-item>
                <el-select v-model="operation.type" placeholder="选择类型">
                    <el-option v-for="{ value, label } in options" :label="label" :value="value"
                        :key="value"></el-option>
                </el-select>
            </el-form-item>
            <template v-if="operation.type == type.create">
                <el-form-item prop="start">
                    <el-col :span="8"><el-text>起始编号：</el-text></el-col>
                    <el-col :span="16"><el-input-number v-model="operation.start" :min="1" :precision="0" /></el-col>
                </el-form-item>
                <el-form-item prop="position">
                    <el-col :span="8"><el-text>坐标：</el-text></el-col>
                    <el-col :span="16"><el-input v-model="operation.position" /></el-col>
                </el-form-item>
                <el-form-item>
                    <el-col :span="8"><el-text>复制次数：</el-text></el-col>
                    <el-col :span="16"><el-input-number v-model="operation.create.times" :min="0"
                            :precision="0" /></el-col>
                </el-form-item>
                <el-form-item prop="gap">
                    <el-col :span="8"><el-text>复制间距：</el-text></el-col>
                    <el-col :span="16"><el-input v-model="operation.gap"
                            :disabled="operation.create.times == 0" /></el-col>
                </el-form-item>
            </template>
            <template v-if="operation.type == type.copy">
                <el-form-item>
                    <el-radio-group v-model="operation.copy.move">
                        <el-radio :value="true">移动</el-radio>
                        <el-radio :value="false">复制</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="选择节点">
                    <el-input v-model="operation.nos" disabled />
                </el-form-item>
                <el-form-item prop="gap">
                    <el-col :span="8"><el-text>间距：</el-text></el-col>
                    <el-col :span="16"><el-input v-model="operation.gap" /></el-col>
                </el-form-item>
                <el-form-item prop="start">
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
                <el-form-item label="选择节点">
                    <el-input v-model="operation.nos" disabled />
                </el-form-item>
                <el-form-item>
                    <el-checkbox v-model="operation.remove.onlyIsolated" label="仅孤立节点" disabled />
                </el-form-item>
            </template>
            <template v-if="operation.type == type.rename">
                <el-form-item label="选择单个节点" prop="nos">
                    <el-input v-model="operation.nos" disabled />
                </el-form-item>
                <el-form-item prop="noNew">
                    <el-col :span="8"><el-text>新编号：</el-text></el-col>
                    <el-col :span="16">
                        <el-input-number v-model="operation.noNew" :min="1" :precision="0" />
                    </el-col>
                </el-form-item>
            </template>
        </el-form>
    </Dialog>
</template>

<style scoped>
.el-input-number{
    width: 100%;
}
</style>
