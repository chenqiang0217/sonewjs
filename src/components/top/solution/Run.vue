<script setup>
import { ref, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { solutionRun } from './solution'
import Dialog from '../Dialog.vue'
import Empty from '../../main/table/Empty.vue'

const model = useModelStore()
const status = useStatusStore()
const tableRef = ref()
const onSelectionChange = (rows) => {
    model.loadStep.forEach(item => item.run = false)
    model.loadStep
        .filter(item => item === rows?.at(-1))
        .forEach(item => {
            if(item === rows?.at(-1)){
                item.run = true
            }
            else{
                item.run = false
            }
        })
    rows.forEach(row => {
        if (!row.run) {
            tableRef.value?.toggleRowSelection(row, false)
        }
    })
}
watch(
    () => status.ui.dialog.apply,
    (apply) => {
        if (apply) {
            solutionRun()
            status.ui.dialog.apply = false
            status.ui.dialog.show = false
        }
    }
)
</script>

<template>
    <Dialog title="求解" :width="600" >
        <el-table :data="model.loadStep" ref="tableRef" @selection-change="onSelectionChange"
            style="width: 100%;  margin-bottom: 20px" highlight-current-row max-height="400" border fit
            show-overflow-tooltip tooltip-effect="light" :header-cell-style="{ 'text-align': 'center' }"
            :cell-style="{ 'text-align': 'center' }">
            <el-table-column type="selection" width="38" />
            <el-table-column type="index" label="编号" width="60" />
            <el-table-column prop="label" label="名称" />
            <el-table-column prop="target" label="目标组别" width="160">
                <template #default="scope">
                    <el-text truncated>{{ scope.row.target.length ? scope.row.target.map(group => group.no).join(',') :
                        '无'
                        }}</el-text>
                </template>
            </el-table-column>
            <el-table-column prop="subStep" label="子步数">
                <template #default="scope">
                    {{ scope.row.subStep.length }}
                </template>
            </el-table-column>
            <el-table-column prop="description" label="描述">
                <template #default="scope">
                    <el-text truncated>{{ scope.row.description.length
                        != 0 ? scope.row.description : '无'
                        }}</el-text>
                </template>
            </el-table-column>
            <template #empty>
                <Empty />
            </template>
        </el-table>
    </Dialog>
</template>

<style scoped>
/* .el-table {
    --el-table-current-row-bg-color: var(--el-color-success-light-9);
    --el-table-row-hover-bg-color: var(--el-color-success-light-9)
} */
</style>
