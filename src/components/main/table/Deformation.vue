<script setup>
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import Empty from './Empty.vue'

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
const node = model.result.find(res => res.step == status.task.view.step).node
const cellWidth = 150
const digits = 3
const columns = [
    { key: '1', title: '节点号', dataKey: 'no', width: cellWidth },
    { key: '2', title: 'x坐标', dataKey: 'x', width: cellWidth },
    { key: '3', title: 'y坐标', dataKey: 'y', width: cellWidth },
    { key: '4', title: 'z坐标', dataKey: 'z', width: cellWidth },
]
</script>

<template>
    <el-table-v2 :columns="columns" :data="node" :width="width" :height="height" :row-height="30" fixed>
        <template #empty>
            <Empty />
        </template>
    </el-table-v2>
</template>

<style></style>
