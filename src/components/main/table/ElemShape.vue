<script setup>
import { useModelStore } from '../../../stores/model'
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
    { key: '2', title: '组', dataKey: 'group', width: cellWidth },
    { key: '3', title: '类型', dataKey: 'type', width: cellWidth },
    { key: '4', title: '分量', dataKey: 'dim', width: cellWidth },
    { key: '5', title: '主单元', dataKey: 'elemPrm', width: cellWidth },
    { key: '6', title: '从单元', dataKey: 'elemSlv', width: cellWidth },
    { key: '7', title: '目标值1', dataKey: 'val1', cellRenderer: ({ cellData: date }) => date.toFixed(digits), width: cellWidth },
    { key: '8', title: '目标值2', dataKey: 'val2', cellRenderer: ({ cellData: date }) => date.toFixed(digits), width: cellWidth },
    { key: '9', title: '目标值3', dataKey: 'val3', cellRenderer: ({ cellData: date }) => date.toFixed(digits), width: cellWidth },
]
</script>

<template>
    <el-table-v2 :columns="columns" :data="model.elemShape" :width="width" :height="height" :row-height="30" fixed />
</template>

<style></style>

