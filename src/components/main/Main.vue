<script setup>
import { watch, reactive, markRaw } from 'vue'
import View from './View.vue'
import Node from './table/Node.vue'
import Elem from './table/Elem.vue'
import Cnst from './table/Cnst.vue'
import NodeShape from './table/NodeShape.vue'
import ElemShape from './table/ElemShape.vue'
import ElemForce from './table/ElemForce.vue'
import Deformation from './table/Deformation.vue'
import Force from './table/Force.vue'
import Chart from './chart/Chart.vue'
import { useStatusStore } from '../../stores/status'

const status = useStatusStore()
const editableTabs = reactive([{
    title: '模型',
    name: 'view',
    component: markRaw(View),
}])
watch(() => status.ui.tab.main.active, (tableName) => {
    if (!editableTabs.map(tab => tab.name).includes(tableName)) {
        let title, component
        switch (tableName) {
            case 'node':
                title = '节点'
                component = Node
                break
            case 'elem':
                title = '单元'
                component = Elem
                break
            case 'cnst':
                title = '约束'
                component = Cnst
                break
            case 'nodeShape':
                title = '节点几何目标'
                component = NodeShape
                break
            case 'elemShape':
                title = '单元几何目标'
                component = ElemShape
                break
            case 'elemForce':
                title = '单元力目标'
                component = ElemForce
                break
            case 'runProgress':
                title = '计算进度'
                component = Chart
                break
            case 'deformation':
                title = '变形'
                component = Deformation
                break
            case 'force':
                title = '内力'
                component = Force
                break
        }
        let tab = {
            title: title,
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
    <el-tabs
        class="wrapper"
        v-model="status.ui.tab.main.active"
        type="border-card"
        closable
        @tab-remove="removeTab"
    >
        <el-tab-pane
            v-for="item in editableTabs"
            :key="item.name"
            :label="item.title"
            :name="item.name"
        >
            <el-auto-resizer>
                <template #default="{ height, width }">
                    <component
                        :is="item.component"
                        :height="height"
                        :width="width"
                    ></component>
                </template>
            </el-auto-resizer>
        </el-tab-pane>
    </el-tabs>
</template>


<style lang="scss" scope>
.wrapper {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    border-right: 0;
}
::v-deep(.el-tabs__content) {
    padding: 0px;
}
</style>