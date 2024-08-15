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
    }
})
const model = useModelStore()
const cellWidth = 150
const columns = [
    { key: 'no', title: '单元号', dataKey: 'no', width: cellWidth },
    { key: 'eType', title: '锁定', dataKey: 'eType.no', width: cellWidth },
    { key: 'femType', title: '类型', dataKey: 'femType.no', width: cellWidth },
    { key: 'mat', title: '材料', dataKey: 'mat.no', width: cellWidth },
    { key: 'sec', title: '截面', dataKey: 'sec.no', width: cellWidth },
    { key: 'iNode', title: 'i节点', dataKey: 'iNode.no', width: cellWidth },
    { key: 'jNode', title: 'j节点', dataKey: 'jNode.no', width: cellWidth }
]
</script>

<template>
    <div style="position: relative;">
        <ToolBar :data="model.elem" />
        <el-table-v2 :columns="columns" :data="model.elem" :width="width" :height="height" :row-height="30" fixed>
            <template #empty>
                <Empty />
            </template>
        </el-table-v2>
    </div>
</template>

<style scoped></style>
