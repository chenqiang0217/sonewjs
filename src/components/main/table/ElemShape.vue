<script setup>
import { useModelStore } from '../../../stores/model'
import Empty from './Empty.vue'
import ToolBar from './ToolBar.vue'

defineProps({
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
})
const model = useModelStore()
const cellWidth = 150
const digits = 3
const columns = [
    { key: '1', title: '序号', dataKey: 'no', width: cellWidth },
    { key: '2', title: '组别', dataKey: 'group.no', width: cellWidth },
    { key: '3', title: '等式类型', dataKey: 'equality', width: cellWidth },
    { key: '4', title: '目标类型', dataKey: 'type.is', width: cellWidth },
    { key: '5', title: '方向', dataKey: 'dim', width: cellWidth },
    { key: '6', title: '从单元', dataKey: 'elemSlv.no', width: cellWidth },
    { key: '7', title: '主单元', dataKey: 'elemPrm.no', width: cellWidth },
    { key: '8', title: '目标值1', dataKey: 'x', cellRenderer: ({ cellData: date }) => date.toFixed(digits), width: cellWidth },
    { key: '9', title: '目标值2', dataKey: 'y', cellRenderer: ({ cellData: date }) => date.toFixed(digits), width: cellWidth },
    { key: '10', title: '目标值3', dataKey: 'z', cellRenderer: ({ cellData: date }) => date.toFixed(digits), width: cellWidth },
]
</script>

<template>
    <div style="position: relative;">
        <ToolBar :data="model.target.elemShape" />
        <el-table-v2 :columns="columns" :data="model.target.elemShape" :width="width" :height="height" :row-height="30"
            fixed>
            <template #empty>
                <Empty />
            </template>
        </el-table-v2>
    </div>
</template>

<style></style>
