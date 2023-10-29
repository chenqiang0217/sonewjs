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
const cellHeight = 30
const columns = [
    { key: 'no', title: '单元号', dataKey: 'no', width: cellWidth },
    { key: 'type', title: '类型', dataKey: 'type', width: cellWidth },
    { key: 'femType', title: '类型', dataKey: 'femType', width: cellWidth },
    { key: 'mat', title: '材料', dataKey: 'mat', width: cellWidth },
    { key: 'sec', title: '截面', dataKey: 'mat', width: cellWidth },
    { key: 'iNode', title: 'i节点', dataKey: 'mat', width: cellWidth },
    { key: 'jNode', title: 'j节点', dataKey: 'mat', width: cellWidth }
]
</script>

<template>
    <el-table-v2 :columns="columns" :data="model.elem" :width="width" :height="height" :row-height="30" fixed />
</template>

<style></style>

