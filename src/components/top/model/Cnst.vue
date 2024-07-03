<script setup>
import { ref, computed, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useView } from '../../../api/view/index'
import { Dim } from '../../../api/model/index'
import { stringToNumberArray } from '../../../api/utils'
import Dialog from '../Dialog.vue'

const model = useModelStore()
const status = useStatusStore()
const view = useView()
const type = {
    add: 1,
    replace: 2,
    remove: 3,
    node: {
        selected: 1,
        keyin: 2
    }
}

const nos = computed(() => Array.from(
    view.scene.metadata.useStatus().mesh.selected.node
).join(','))

const operation = ref({
    type: type.add,
    nos,
    start: 1,
    dim: {
        x: true,
        y: true,
        z: true
    },
    cs: model.cs[0].no
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
    (apply) => {
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
    let cnstExist, no
    if ((operation.value.type == type.add || operation.value.type == type.replace) && dim != Dim.NONE) {
        points.forEach(point => {
            const node = point.mesh.metadata
            const cnst = model.cnst.find(cnst => cnst.node === node)
            if (cnst) {
                if (operation.value.type == type.add) {
                    cnst.dim = cnst.dim | dim
                }
                else {
                    cnst.dim = cnst.dim
                }
            }
            else {
                no = operation.value.start
                cnstExist = model.cnst.map(cnst => cnst.no).filter(item => item >= no)
                while (true) {
                    const index = cnstExist.findIndex(item => item == no)
                    if (index != -1) {
                        cnstExist.splice(index, 1)
                        no += 1
                    }
                    else {
                        model.createCnst([no, node.no, dim, operation.value.cs])
                        no += 1
                        break
                    }
                }
            }
        })
    }
    else if (operation.value.type == type.remove) {
        points.forEach(point =>
            model.cnst.filter(cnst => cnst.node === point.mesh.metadata).forEach(cnst => model.removeCnst(cnst))
        )
    }
    view.scene.metadata.useStatus().mesh.selected.node.clear()
    view.scene.metadata.useStatus().mesh.selected.elem.clear()
}
</script>

<template>
    <Dialog title="支座" :width="250">
        <el-form :model="operation" label-position="top" status-icon>
            <el-form-item>
                <el-radio-group v-model="operation.type">
                    <el-radio v-for="{ value, label } in options" :value="value">{{ label }}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="选择节点">
                <el-input v-model="operation.nos" disabled />
            </el-form-item>
            <template v-if="operation.type != type.remove">
                <el-text class="el-form-item__label">方向</el-text>
                <el-row>
                    <el-col :span="8" v-for="key in Object.keys(operation.dim)">
                        <el-form-item>
                            <el-checkbox v-model="operation.dim[key]" :label="key" disabled />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="坐标系">
                    <el-select v-model="operation.cs" disabled>
                        <el-option v-for="cs in model.cs" :label="cs.label" :value="cs.no" :key="cs.no"></el-option>
                    </el-select>
                </el-form-item>
            </template>
        </el-form>
    </Dialog>
</template>

<style scoped></style>
