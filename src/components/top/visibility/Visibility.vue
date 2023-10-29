<script setup>
import { useStatusStore } from '../../../stores/status'
import { setTextToMeshNo } from '../../../stores/view'
import { CONSTANT } from '../../../stores/constant'
import { ref } from 'vue'

const status = useStatusStore()

const show = ref({
    label: {
        node: false,
        elem: false,
    },
})
const switchNodeLabelVisibility = () => {
    show.value.label.node = !show.value.label.node
    if (status.mode === CONSTANT.MODE.RSLT) {
        setTextToMeshNo(CONSTANT.VIEW.PREFIX.MESH.NODE.RSLT)
    }
    status.view.text.visible.node = show.value.label.node
}
const switchElemLabelVisibility = () => {
    show.value.label.elem = !show.value.label.elem
    if (status.mode === CONSTANT.MODE.RSLT) {
        setTextToMeshNo(CONSTANT.VIEW.PREFIX.MESH.ELEM.RSLT, show.value.label.elem)
    }
    status.view.text.visible.elem = show.value.label.elem
}
</script>


<template>
    <el-button-group>
        <el-tooltip content="active" placement="bottom">
            <el-button>
                <IconFront iconName="active"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="frozen" placement="bottom">
            <el-button>
                <IconFront iconName="frezone"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="节点" placement="bottom">
            <el-button
                @click="
                    status.view.mesh.visible.node =
                        !status.view.mesh.visible.node
                "
            >
                <IconFront iconName="node"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="节点号" placement="bottom">
            <el-button @click="switchNodeLabelVisibility()">
                <IconFront iconName="node-no"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="单元号" placement="bottom">
            <el-button @click="switchElemLabelVisibility()">
                <IconFront iconName="element-no"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="setting" placement="bottom">
            <el-button>
                <IconFront iconName="setting"></IconFront>
            </el-button>
        </el-tooltip>
    </el-button-group>
</template>


<style></style>