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
const columns = [
    { key: '1', title: '序号', dataKey: 'no', width: cellWidth },
    { key: '2', title: '节点', dataKey: 'node.no', width: cellWidth },
    { key: '3', title: '方向', dataKey: 'dim', width: cellWidth },
    { key: '4', title: '坐标系', dataKey: 'cs.no', width: cellWidth },
]
</script>


<template>
    <div style="position: relative;">
        <ToolBar :data="model.cnst" />
        <el-table-v2 :columns="columns" :data="model.cnst" :width="width" :height="height" :row-height="30" fixed>
            <template #empty>
                <Empty />
            </template>
        </el-table-v2>
    </div>
</template>
<style></style>
