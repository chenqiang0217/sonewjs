<script setup>
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
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
const status = useStatusStore()
const index = status.task.view.index
const elem = model.result[index].elem
const cellWidth = 150
const columns = [
    { key: '1', title: '单元号', dataKey: 'no', width: cellWidth },
    { key: '2', title: '长度', dataKey: 'l', width: cellWidth },
    { key: '3', title: '力密度', dataKey: 'q', width: cellWidth },
    { key: '4', title: '内力', dataKey: 'f', width: cellWidth },
]
</script>

<template>
    <div style="position: relative;">
        <ToolBar :data="elem" />
        <el-table-v2 :columns="columns" :data="elem" :width="width" :height="height" :row-height="30" fixed>
            <template #empty>
                <Empty />
            </template>
        </el-table-v2>
    </div>
</template>

<style></style>
