<script setup>
import { nextTick, ref, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import Dialog from '../Dialog.vue'
import Empty from '../../main/table/Empty.vue'

const model = useModelStore()
const status = useStatusStore()
const rowIndex = ref()
const cellRef = ref()
const cell = ref({
    row: void 0,
    column: void 0,
    data: void 0
})
const onRowClick = row => {
    rowIndex.value = model.target.group.findIndex(group => group == row)
}
const createTargetGroup = () => {
    let no = 1
    const noExist = model.target.group.map(group => group.no).filter(item => item >= no)
    while (true) {
        const index = noExist.findIndex(item => item == no)
        if (index != -1) {
            noExist.splice(index, 1)
            no += 1
        }
        else {
            model.createTargetGroup(no)
            break
        }
    }
}
const removeTargetGroup = () => {
    if (rowIndex.value !== void 0) {
        const targetGroup = model.target.group[rowIndex.value]
        if (![...model.target.nodeShape, ...model.target.elemShape, ...model.target.elemForce]
            .some(item => item.group === targetGroup)) {
            model.removeTargetGroup(targetGroup)
            rowIndex.value -= 1
            if (rowIndex.value == -1) {
                rowIndex.value = void 0
            }
        }
    }
}
const cellEdit = (scope, cell) => {
    //cell 须不带value进行访问
    cell.row = scope.$index
    cell.column = scope.cellIndex
    cell.data = scope.row[scope.column.property]
    nextTick(() => {
        const td = cellRef.value.ref.parentNode.parentNode.parentNode.parentNode
        td.style.paddingTop = '0px'
        td.style.paddingBottom = '0px'
        cellRef.value.focus()
    })
}

const cellEditCompleted = (scope, cell, dataType = 'string') => {
    //cell 须不带value进行访问
    let data
    switch (dataType) {
        case 'string':
            data = cell.data
            break
        case 'float':
            data = Number(cell.data)
            break
        case 'interger':
            data = Number.parseInt(Number(cell.data))
            break
    }
    if (!Number.isNaN(data)) {
        const key = scope.column.property
        scope.row[key] = data
    }
    const td = cellRef.value.ref.parentNode.parentNode.parentNode.parentNode
    td.style.paddingTop = '8px'
    td.style.paddingBottom = '8px'
    cell.row = void 0
    cell.column = void 0
}
watch(
    () => status.ui.dialog.apply,
    (apply) => {
        if (apply) {
            status.ui.dialog.apply = false
        }
    }
)
</script>

<template>
    <Dialog title="目标类别" :width="500">
        <!-- 求解工况表格 -->
        <div style="display: flex;padding-bottom: 5px;">
            <el-text tag="b" type="info" style="margin-right: auto;">目标组别</el-text>
            <el-button round @click="createTargetGroup"><el-text type="info">
                    <IconFront iconName="node-plus"></IconFront> 添加
                </el-text></el-button>
            <el-button round @click="removeTargetGroup"><el-text type="info">
                    <IconFront iconName="node-minus"></IconFront> 删除
                </el-text> </el-button>
        </div>
        <el-table :data="model.target.group" @row-click="onRowClick" style="width: 100%;  margin-bottom: 20px"
            highlight-current-row max-height="400" border fit show-overflow-tooltip tooltip-effect="light"
            :header-cell-style="{ 'text-align': 'center' }" :cell-style="{ 'text-align': 'center' }">
            <el-table-column prop="no" label="编号" width="80" />
            <el-table-column prop="label" label="名称">
                <template #default="scope">
                    <el-input v-if="cell.row === scope.$index && cell.column === scope.cellIndex" v-model="cell.data"
                        ref="cellRef" @keyup.enter="event => event.target.blur()"
                        @blur="cellEditCompleted(scope, cell)" />
                    <el-text v-else @dblclick="cellEdit(scope, cell)" truncated>{{ scope.row.label.length
                        != 0 ? scope.row.label : '无' }}</el-text>
                </template>
            </el-table-column>
            <el-table-column prop="description" label="描述">
                <template #default="scope">
                    <el-input v-if="cell.row === scope.$index && cell.column === scope.cellIndex" v-model="cell.data"
                        ref="cellRef" @keyup.enter="event => event.target.blur()"
                        @blur="cellEditCompleted(scope, cell)" />
                    <el-text v-else @dblclick="cellEdit(scope, cell)" truncated>{{ scope.row.description.length
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
.el-button {
    height: 2em;
}

.el-table .el-text {
    display: block;
    width: 100%;
    text-align: center
}
</style>
