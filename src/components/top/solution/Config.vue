<script setup>
import { nextTick, ref, watch } from 'vue'
import { useStatusStore } from '../../../stores/status'
import { useConfigStore } from '../../../stores/config'
const config = useConfigStore()
const status = useStatusStore()
const tableRowIndex = ref(0)
const tableCellIndex = ref({
    row: undefined,
    column: undefined
})
const tableCellRef = ref(null)
const onRowClick = row => {
    const index = config.task.loadStep.findIndex(
        loadStep => loadStep.no == row.no
    )
    tableRowIndex.value = index
}
const tableCellEdit = scope => {
    tableCellIndex.value.row = scope.$index
    tableCellIndex.value.column = scope.column.id
    nextTick(() => {
        tableCellRef.value.focus()
    })
}
const tableCellEditCompleted = scope => {
    //判断数字类型
    // console.log(scope.row[scope.column.property])
    tableCellIndex.value.row = undefined
    tableCellIndex.value.column = undefined
}
watch(
    () => status.ui.dialog.apply,
    (apply) => {
        if(apply){
            status.ui.dialog.apply = false
        }
    }
)
</script>

<template>
    <div style="display: flex; padding: 0 25px; justify-content: end">
        <el-button> 添加工况 </el-button>
        <el-button> 删除工况 </el-button>
    </div>
    <el-table
        :data="config.task.loadStep"
        style="width: 100%"
        highlight-current-row
        @current-change="onRowClick"
        max-height="400"
        stripe
    >
        <el-table-column
            prop="no"
            label="编号"
            width="60"
        >
        </el-table-column>
        <el-table-column
            prop="name"
            label="名称"
        >
            <template #default="scope">
                <el-input
                    v-if="
                        tableCellIndex.row === scope.$index &&
                        tableCellIndex.column === scope.column.id
                    "
                    v-model="scope.row.name"
                    ref="tableCellRef"
                    @keyup.enter="$event => $event.target.blur()"
                    @blur="tableCellEditCompleted(scope)"
                />
                <p
                    v-else
                    @dblclick="tableCellEdit(scope)"
                >
                    {{ scope.row.name }}
                </p>
            </template>
        </el-table-column>
        <el-table-column
            prop="categorization"
            label="分类"
        >
            <template #default="scope">
                <el-input
                    v-if="
                        tableCellIndex.row === scope.$index &&
                        tableCellIndex.column === scope.column.id
                    "
                    v-model="scope.row.categorization"
                    ref="tableCellRef"
                    @keyup.enter="$event => $event.target.blur()"
                    @blur="tableCellEditCompleted(scope)"
                />
                <p
                    v-else
                    @dblclick="tableCellEdit(scope)"
                >
                    {{ scope.row.categorization }}
                </p>
            </template>
        </el-table-column>
        <el-table-column
            prop="nSubStep"
            label="子步数"
        >
            <template #default="scope">
                <el-input
                    v-if="
                        tableCellIndex.row === scope.$index &&
                        tableCellIndex.column === scope.column.id
                    "
                    v-model="scope.row.nSubStep"
                    ref="tableCellRef"
                    @keyup.enter="$event => $event.target.blur()"
                    @blur="tableCellEditCompleted(scope)"
                />
                <p
                    v-else
                    @dblclick="tableCellEdit(scope)"
                >
                    {{ scope.row.nSubStep }}
                </p>
            </template>
        </el-table-column>
        <el-table-column
            prop="description"
            label="描述"
            show-overflow-tooltip
        >
            <template #default="scope">
                <el-input
                    v-if="
                        tableCellIndex.row === scope.$index &&
                        tableCellIndex.column === scope.column.id
                    "
                    v-model="scope.row.description"
                    ref="tableCellRef"
                    @keyup.enter="$event => $event.target.blur()"
                    @blur="tableCellEditCompleted(scope)"
                />
                <p
                    v-else
                    @dblclick="tableCellEdit(scope)"
                >
                    {{ scope.row.description }}
                </p>
            </template>
        </el-table-column>
    </el-table>

    <el-table
        :data="config.task.loadStep[tableRowIndex].subStep"
        style="width: 100%; padding: 20px 0px"
        max-height="500"
        stripe
        v-if="tableRowIndex !== undefined"
    >
        <el-table-column
            prop="no"
            label="子步编号"
            width="60"
        >
        </el-table-column>
        <el-table-column
            prop="nIterativeStep"
            label="迭代步数"
        >
            <template #default="scope">
                <el-input
                    v-if="
                        tableCellIndex.row === scope.$index &&
                        tableCellIndex.column === scope.column.id
                    "
                    v-model="scope.row.nIterativeStep"
                    ref="tableCellRef"
                    @keyup.enter="$event => $event.target.blur()"
                    @blur="tableCellEditCompleted(scope)"
                />
                <p
                    v-else
                    @dblclick="tableCellEdit(scope)"
                >
                    {{ scope.row.nIterativeStep }}
                </p>
            </template>
        </el-table-column>
        <el-table-column
            prop="alpha"
            label="不等式权重"
        >
            <template #default="scope">
                <el-input
                    v-if="
                        tableCellIndex.row === scope.$index &&
                        tableCellIndex.column === scope.column.id
                    "
                    v-model="scope.row.alpha"
                    ref="tableCellRef"
                    @keyup.enter="$event => $event.target.blur()"
                    @blur="tableCellEditCompleted(scope)"
                />
                <p
                    v-else
                    @dblclick="tableCellEdit(scope)"
                >
                    {{ Number(scope.row.alpha).toExponential(2) }}
                </p>
            </template>
        </el-table-column>
        <el-table-column
            prop="rsdl"
            label="误差限值"
        >
            <template #default="scope">
                <el-input
                    v-if="
                        tableCellIndex.row === scope.$index &&
                        tableCellIndex.column === scope.column.id
                    "
                    v-model="scope.row.rsdl"
                    ref="tableCellRef"
                    @keyup.enter="$event => $event.target.blur()"
                    @blur="tableCellEditCompleted(scope)"
                />
                <p
                    v-else
                    @dblclick="tableCellEdit(scope)"
                >
                    {{ Number(scope.row.rsdl).toExponential(2) }}
                </p>
            </template>
        </el-table-column>
    </el-table>
</template>

<style lang="scss" scoped>
::v-deep(.el-table__cell) {
    padding: 3px 0px;
    border: 0;
}
::v-deep(.cell) {
    padding: 3px 0;
    text-align: center;
}
::v-deep(.el-input) {
    height: 22px;
}
</style>
