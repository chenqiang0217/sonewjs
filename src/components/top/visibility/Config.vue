<script setup>
import { ref, watch } from 'vue'
import { useStatusStore } from '../../../stores/status'
import { useView } from '../../../api/view/index'
import Dialog from '../Dialog.vue'
import Font from './Font.vue'

const status = useStatusStore()
const view = useView()
const configView = view.scene.metadata.useConfig()
const constant = view.scene.metadata.constant

const type = {
    font: 1,
    color: 2,
}
const operation = ref({
    type: type.font,
})
const options = ref([
    {
        label: '字体',
        value: type.font,
    },
    {
        label: '单元颜色',
        value: type.color,
    }
])
const fontConfigs = ref({
    current: 1,
    node: {
        label: {
            no: 1,
            dirty: false,
            font: configView.textBlock.node.label
        },
        nodeShape: {
            no: 2,
            dirty: false,
            font: configView.textBlock.node.target.nodeShape
        }
    },
    elem: {
        label: {
            no: 3,
            dirty: false,
            font: configView.textBlock.elem.label
        },
        elemShape: {
            no: 4,
            dirty: false,
            font: configView.textBlock.elem.target.elemShape
        },
        elemForce: {
            no: 5,
            dirty: false,
            font: configView.textBlock.elem.target.elemForce
        }
    }
})

const fontConfig = ref(
    {
        no: fontConfigs.value.node.label.no,
        font: {
            family: fontConfigs.value.node.label.font.family,
            size: fontConfigs.value.node.label.font.size,
            color: fontConfigs.value.node.label.font.color
        }
    }
)
const fontChange = (f) => {
    fontConfig.value.font = f
    const cfg = Object.values(fontConfigs.value).map(item => Object.values(item)).flat().find(item => item.no == fontConfig.value.no)
    Object.keys(cfg.font).forEach(key => {
        if (cfg.font[key] != f[key]) {
            cfg.font[key] = f[key]
            cfg.dirty = true
        }
    })
}

const fontTree = [
    {
        id: 1,
        label: '节点',
        children: [{
            id: 3,
            label: '节点标签',
            config: fontConfigs.value.node.label
        }, {
            id: 4,
            label: '节点几何',
            config: fontConfigs.value.node.nodeShape
        }]
    }
    , {
        id: 2,
        label: '单元',
        children: [{
            id: 5,
            label: '单元标签',
            config: fontConfigs.value.elem.label
        }, {
            id: 6,
            label: '单元几何',
            config: fontConfigs.value.elem.elemShape
        }, {
            id: 7,
            label: '单元预应力',
            config: fontConfigs.value.elem.elemForce
        }]
    }
]
const refTree = ref()
const onNodeClick = (event, object, node, element) => {
    if (object.data.config) {
        fontConfig.value.no = object.data.config.no
        fontConfigs.value.current = object.data.config.no
        Object.keys(fontConfig.value.font).forEach(key => {
            fontConfig.value.font[key] = object.data.config.font[key]
        })
    }
}
const elemColorBindings = [
    { label: '自由、锁定', key: constant.COLOR.MESH.ELEM.BINDING.ETYPE },
    { label: '类型', key: constant.COLOR.MESH.ELEM.BINDING.FEMTYPE },
    { label: '材料', key: constant.COLOR.MESH.ELEM.BINDING.MAT },
    { label: '截面', key: constant.COLOR.MESH.ELEM.BINDING.SEC },
]
const elemTextBindings = [
    { label: '编号', key: constant.COLOR.MESH.ELEM.BINDING.NO },
    { label: '类型', key: constant.COLOR.MESH.ELEM.BINDING.FEMTYPE },
    { label: '材料', key: constant.COLOR.MESH.ELEM.BINDING.MAT },
    { label: '截面', key: constant.COLOR.MESH.ELEM.BINDING.SEC },
]
const meshColorBinding = ref(configView.mesh.elem.color.binding)
const elemTextBinding = ref(configView.textBlock.elem.label.binding)

watch(
    () => status.ui.dialog.apply,
    (apply) => {
        if (apply) {
            status.ui.dialog.apply = false
            onApply()
        }
    }
)
function onApply() {
    switch (operation.value.type) {
        case type.font:
            Object.values(fontConfigs.value).map(item => Object.values(item)).flat().filter(item => item.dirty).forEach(item => {
                switch (item.no) {
                    case 1:
                        Array.from([...view.points.prep, ...view.points.rslt]).forEach(point => point.updateLabelStyle(point.textBlock.label))
                        break
                    case 2:
                        view.points.prep.forEach(point => point.updateLabelStyle(point.textBlock.target.nodeShape))
                        break
                    case 3:
                        const lines = [...view.lines.prep, ...view.lines.rslt]
                        lines.forEach(line => line.updateLabelStyle(line.textBlock.label))
                        if (elemTextBinding.value != configView.textBlock.elem.label.binding) {
                            configView.textBlock.elem.label.binding = elemTextBinding.value
                            lines.forEach(line => line.updateLabelText())
                        }
                        break
                    case 4:
                        view.lines.prep.forEach(line => line.updateLabelStyle(line.textBlock.target.elemShape))
                        break
                    case 5:
                        view.lines.prep.forEach(line => line.updateLabelStyle(line.textBlock.target.elemForce))
                        break
                }
                item.dirty = false
            })
            break
        case type.color:
            if (configView.mesh.elem.color.binding != meshColorBinding.value) {
                configView.mesh.elem.color.binding = meshColorBinding.value
                Array.from([...view.lines.prep, ...view.lines.rslt]).forEach(line => line.updateMeshColor())
            }
            break
    }
}
</script>

<template>
    <Dialog title="显示设置" :width="500">
        <el-form :model="operation" label-position="top" status-icon>
            <el-form-item>
                <el-select v-model="operation.type" placeholder="选择类型">
                    <el-option v-for="{ value, label } in options" :label="label" :value="value"
                        :key="value"></el-option>
                </el-select>
            </el-form-item>
            <div v-show="operation.type == type.font" style="display: flex;align-items: stretch;">
                <el-scrollbar style="flex: 0 0 150px;padding-right: 10px">
                    <el-tree ref="refTree" :data="fontTree" node-key="id" highlight-current default-expand-all
                        @node-click="onNodeClick">
                    </el-tree>
                </el-scrollbar>
                <div style="flex: 1;padding-left: 10px; border-left: 1px solid var(--el-border-color);">
                    <Font style="width: 100%;" :family="fontConfig.font.family" :size="fontConfig.font.size"
                        :color="fontConfig.font.color" @change="fontChange" />
                    <el-form-item v-if="fontConfigs.current == 3">
                        <el-radio-group v-model="elemTextBinding" @change="fontConfigs.elem.label.dirty = true">
                            <el-radio v-for="{ label, key } in elemTextBindings" :value="key">{{ label
                                }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </div>
            </div>
            <div v-show="operation.type == type.color">
                <el-form-item>
                    <el-radio-group v-model="meshColorBinding">
                        <el-radio v-for="{ label, key } in elemColorBindings" :value="key">{{ label }}</el-radio>
                    </el-radio-group>
                </el-form-item>
            </div>
        </el-form>
    </Dialog>
</template>

<style scoped>

</style>
