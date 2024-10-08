<script setup>
import { watch, reactive, markRaw } from 'vue'
import View from './view/View.vue'
import Node from './table/Node.vue'
import Elem from './table/Elem.vue'
import Cnst from './table/Cnst.vue'
import NodeShape from './table/NodeShape.vue'
import ElemShape from './table/ElemShape.vue'
import ElemForce from './table/ElemForce.vue'
import NodeRslt from './table/NodeRslt.vue'
import ElemRslt from './table/ElemRslt.vue'
import Chart from './chart/Chart.vue'
import { useStatusStore } from '../../stores/status'

const props = defineProps({
    w: {
        type: Number,
        required: true,
    },
    h: {
        type: Number,
        required: true,
    }
})

const status = useStatusStore()
const editableTabs = reactive([{
    title: '模型',
    name: 'view',
    icon: 'model',
    component: markRaw(View),
}])
watch(() => status.ui.tab.main.active, (tableName) => {
    if (!editableTabs.map(tab => tab.name).includes(tableName)) {
        let title, component, icon
        switch (tableName) {
            case 'node':
                title = '节点'
                icon = 'table'
                component = Node
                break
            case 'elem':
                title = '单元'
                icon = 'table'
                component = Elem
                break
            case 'cnst':
                title = '约束'
                icon = 'table'
                component = Cnst
                break
            case 'nodeShape':
                title = '节点几何目标'
                icon = 'table'
                component = NodeShape
                break
            case 'elemShape':
                title = '单元几何目标'
                icon = 'table'
                component = ElemShape
                break
            case 'elemForce':
                title = '单元力目标'
                icon = 'table'
                component = ElemForce
                break
            case 'runProgress':
                title = '计算进度'
                icon = 'chart'
                component = Chart
                break
            case 'nodeRslt':
                title = '变形'
                icon = 'table'
                component = NodeRslt
                break
            case 'elemRslt':
                title = '内力'
                icon = 'table'
                component = ElemRslt
                break
        }
        let tab = {
            title,
            icon,
            name: tableName,
            component: markRaw(component),
        }
        editableTabs.push(tab)
    }
    let index = status.ui.tab.main.list.findIndex(name => name === tableName)
    status.ui.tab.main.list.push(
        status.ui.tab.main.list.splice(index, 1)[0]
    )
})
const removeTab = (tableName) => {
    if (tableName === `view`) {
        return
    }
    let index = editableTabs.findIndex(tab => tab.name === tableName)
    editableTabs.splice(index, 1)
    index = status.ui.tab.main.list.findIndex(name => name === tableName)
    status.ui.tab.main.list.splice(index, 1)
    status.ui.tab.main.active = status.ui.tab.main.list.at(-1)
}
</script>


<template>
    <el-tabs v-model="status.ui.tab.main.active" type="border-card" closable
        :style="{ 'height': props.h + 'px', 'width': props.w + 'px' }" @tab-remove="removeTab">
        <el-tab-pane v-for="item in editableTabs" :key="item.name" :label="item.title" :name="item.name">
            <template #label>
                <span>
                    <IconFront :iconName=item.icon></IconFront>
                    <span>{{ item.title }}</span>
                </span>
            </template>
            <el-auto-resizer>
                <template #default="{ width, height }">
                    <component :is="item.component" :width="width" :height="height"></component>
                </template>
            </el-auto-resizer>
        </el-tab-pane>
    </el-tabs>
</template>


<style scope>
.el-tabs {
    display: grid;
    grid-template-rows: auto 1fr;
}
</style>