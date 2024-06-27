<script setup>
import { nextTick, ref, watch } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { LoadStep, Substep } from '../../../api/model/index'

const model = useModelStore()
const status = useStatusStore()
const rowIndex = ref(0)
const cellRef = ref()
const cellLoadStep = ref({
    row: undefined,
    column: undefined,
    data: undefined
})
const cellSubStep = ref({
    row: undefined,
    column: undefined,
    data: undefined
})
const onRowClick = row => {
    rowIndex.value = model.loadStep.findIndex(loadStep => loadStep == row)
}
const createSubStep = () => {
    model.loadStep[rowIndex.value].subStep.push(new Substep())
}
const removeSubStep = () => {
    const subStep = model.loadStep[rowIndex.value].subStep
    if (subStep.length > 1) {
        subStep.pop()
    }
}
const createLoadStep = () => {
    model.loadStep.push(new LoadStep('', [], [new Substep()]))
}
const removeLoadStep = () => {
    if ( model.loadStep.length > 1) {
        rowIndex.value = 0
        model.loadStep.pop()
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
const cellSelect = (scope, cell) => {
    //cell 须不带value进行访问
    cell.row = scope.$index
    cell.column = scope.cellIndex
    cell.data = scope.row[scope.column.property].map(item => item.no)
    nextTick(() => {
        const td = cellRef.value.selectRef.parentNode.parentNode
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
    cell.row = undefined
    cell.column = undefined
}
const cellSelectCompleted = (cell) => {
    //cell 须不带value进行访问
    model.loadStep[rowIndex.value].target = cell.data.map(
        no => model.target.group.find(group => group.no == no)
    )
    const td = cellRef.value.selectRef.parentNode.parentNode
    td.style.paddingTop = '8px'
    td.style.paddingBottom = '8px'
    cell.row = undefined
    cell.column = undefined
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
    <!-- 求解工况表格 -->
    <div style="display: flex;padding-bottom: 5px;">
        <el-text tag="b" type="info" style="margin-right: auto;">求解工况</el-text>
        <el-button round @click="createLoadStep"><el-text type="info">
                <IconFront iconName="node-plus"></IconFront> 添加
            </el-text></el-button>
        <el-button round @click="removeLoadStep"><el-text type="info">
                <IconFront iconName="node-minus"></IconFront> 删除
            </el-text> </el-button>
    </div>
    <el-table :data="model.loadStep" @row-click="onRowClick" style="width: 100%;  margin-bottom: 20px"
        highlight-current-row max-height="400" border fit show-overflow-tooltip tooltip-effect="light"
        :header-cell-style="{ 'text-align': 'center' }" :cell-style="{ 'text-align': 'center' }">
        <el-table-column type="index" label="编号" width="60" />
        <el-table-column prop="label" label="名称">
            <template #default="scope">
                <el-input v-if="cellLoadStep.row === scope.$index && cellLoadStep.column === scope.cellIndex"
                    v-model="cellLoadStep.data" ref="cellRef" @keyup.enter="event => event.target.blur()"
                    @blur="cellEditCompleted(scope, cellLoadStep)" />
                <el-text v-else @dblclick="cellEdit(scope, cellLoadStep)" truncated>{{ scope.row.label.length
                    != 0 ? scope.row.label : '无' }}</el-text>
            </template>
        </el-table-column>
        <el-table-column prop="target" label="目标组别" width="160">
            <template #default="scope">
                <el-select v-if="cellLoadStep.row === scope.$index && cellLoadStep.column === scope.cellIndex"
                    v-model="cellLoadStep.data" ref="cellRef" multiple
                    @blur="cellSelectCompleted(cellLoadStep)" collapse-tags>
                    <el-option v-for="{ no, label } in model.target.group" :label="label" :value="no"
                        :key="no"></el-option>
                </el-select>
                <el-text v-else @dblclick="cellSelect(scope, cellLoadStep)" truncated>{{
                    scope.row.target.length ?  scope.row.target.map(group => group.no).join(','):'无'}}</el-text>
            </template>
        </el-table-column>
        <el-table-column prop="nSubStep" label="子步数">
        </el-table-column>
        <el-table-column prop="description" label="描述">
            <template #default="scope">
                <el-input v-if="cellLoadStep.row === scope.$index && cellLoadStep.column === scope.cellIndex"
                    v-model="cellLoadStep.data" ref="cellRef" @keyup.enter="event => event.target.blur()"
                    @blur="cellEditCompleted(scope, cellLoadStep)" />
                <el-text v-else @dblclick="cellEdit(scope, cellLoadStep)" truncated>{{ scope.row.description.length
                    != 0 ? scope.row.description : '无'
                    }}</el-text>
            </template>
        </el-table-column>
    </el-table>
    <!-- 求解子步表格 -->
    <div style="display: flex;padding-bottom: 5px;">
        <el-text tag="b" type="info" style="margin-right: auto;">子步</el-text>
        <el-button round @click="createSubStep"><el-text type="info">
                <IconFront iconName="node-plus"></IconFront> 添加
            </el-text></el-button>
        <el-button round @click="removeSubStep"><el-text type="info">
                <IconFront iconName="node-minus"></IconFront> 删除
            </el-text> </el-button>
    </div>
    <el-table :data="model.loadStep[rowIndex].subStep" style="width: 100%; margin-bottom: 20px" max-height="500" stripe
        border fit show-overflow-tooltip :header-cell-style="{ 'text-align': 'center' }"
        :cell-style="{ 'text-align': 'center' }">
        <el-table-column type="index" label="编号" width="60" />
        <el-table-column prop="nIterativeStep" label="迭代步数">
            <template #default="scope">
                <el-input v-if="cellSubStep.row === scope.$index && cellSubStep.column === scope.cellIndex"
                    v-model="cellSubStep.data" ref="cellRef" @keyup.enter="event => event.target.blur()"
                    @blur="cellEditCompleted(scope, cellSubStep, 'interger')" />
                <el-text v-else @dblclick="cellEdit(scope, cellSubStep)">{{ scope.row.nIterativeStep }}</el-text>
            </template>
        </el-table-column>
        <el-table-column prop="alpha" label="不等式权重">
            <template #default="scope">
                <el-input v-if="cellSubStep.row === scope.$index && cellSubStep.column === scope.cellIndex"
                    v-model="cellSubStep.data" ref="cellRef" @keyup.enter="event => event.target.blur()"
                    @blur="cellEditCompleted(scope, cellSubStep, 'interger')" />
                <el-text v-else @dblclick="cellEdit(scope, cellSubStep)"> {{ Number(scope.row.alpha).toExponential(2)
                    }}</el-text>
            </template>
        </el-table-column>
        <el-table-column prop="rsdl" label="误差限值">
            <template #default="scope">
                <el-input v-if="cellSubStep.row === scope.$index && cellSubStep.column === scope.cellIndex"
                    v-model="cellSubStep.data" ref="cellRef" @keyup.enter="event => event.target.blur()"
                    @blur="cellEditCompleted(scope, cellSubStep, 'float')" />
                <el-text v-else @dblclick="cellEdit(scope, cellSubStep)"> {{ Number(scope.row.rsdl).toExponential(2)
                    }}</el-text>
            </template>
        </el-table-column>
    </el-table>
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
