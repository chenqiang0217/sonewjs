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
const columns = [
    { key: '1', title: '序号', dataKey: 'no', width: cellWidth },
    { key: '2', title: '组别', dataKey: 'group.no', width: cellWidth },
    { key: '3', title: '等式类型', dataKey: 'equality', width: cellWidth },
    { key: '4', title: '目标类型', dataKey: 'type', width: cellWidth },
    { key: '5', title: '方向', dataKey: 'dim', width: cellWidth },
    { key: '6', title: '主节点', dataKey: 'nodePrm.no', width: cellWidth },
    { key: '7', title: '从节点', dataKey: 'nodeSlv.no', width: cellWidth },
    { key: '8', title: '目标值x', dataKey: 'x', width: cellWidth },
    { key: '9', title: '目标值y', dataKey: 'y', width: cellWidth },
    { key: '10', title: '目标值z', dataKey: 'z', width: cellWidth },
]
</script>

<template>
    <el-table-v2 :columns="columns" :data="model.target.nodeShape" :width="width" :height="height" :row-height="30" fixed />
</template>

<style></style>

