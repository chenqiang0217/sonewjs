<script setup>
import { ref } from "vue"
import { view } from "../../stores/view"
import { CONSTANT } from "../../stores/constant"

import { useModelStore } from "../../stores/model"
import { useStatusStore } from "../../stores/status"

const model = useModelStore()
const status = useStatusStore()
const props = defineProps({
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    },
    tag: {
        type: Object,
        required: true,
        default: {
            view: {
                from: "",
                mesh: "",
                label: "",
            },
            table: "",
        },
    },
    minWidth: {
        type: Number,
        required: false,
        default: 250,
    },
    theme: {
        type: String,
        required: false,
        default: "flat",
    },
})
const show = ref(false)
defineExpose({ show })
const onClick = (action, mode, {view, table}) => {
    let meshList, mesh
    switch (action) {
        case `select`:
            meshList = model.filter(view)
            mesh = view.mesh
            switch (mode) {
                case CONSTANT.VIEW.SELECTING.S:
                    status.view.mesh.selected[mesh].clear()
                    meshList.forEach((item) =>
                        status.view.mesh.selected[mesh].add(item)
                    )
                    break
                case CONSTANT.VIEW.SELECTING.A:
                    meshList.forEach((item) =>
                        status.view.mesh.selected[mesh].add(item)
                    )
                    break
                case CONSTANT.VIEW.SELECTING.U:
                    meshList.forEach((item) =>
                        status.view.mesh.selected[mesh].delete(item)
                    )
                    break
            }
            break
        case `activate`:
            break
        case `table`:
            status.addMainTab(table)
            break
    }
};
</script>

<template>
    <ContextMenu v-model:show="show" :options="{ x, y, minWidth, theme }">
        <ContextMenuItem
            label="选择"
            @click="onClick(`select`, CONSTANT.VIEW.SELECTING.S, tag)"
        >
            <template #icon>
                <IconFront iconName="select-s" size="small" />
            </template>
        </ContextMenuItem>
        <ContextMenuItem
            label="再选择"
            @click="onClick(`select`, CONSTANT.VIEW.SELECTING.A, tag)"
        >
            <template #icon>
                <IconFront iconName="select-a" size="small" />
            </template>
        </ContextMenuItem>
        <ContextMenuItem
            label="解除选择"
            @click="onClick(`select`, CONSTANT.VIEW.SELECTING.U, tag)"
        >
            <template #icon>
                <IconFront iconName="select-u" size="small" />
            </template>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
            label="激活"
            
        >
            <template #icon>
                <IconFront iconName="active" size="small" />
            </template>
        </ContextMenuItem>
        <ContextMenuItem
            label="再激活"
            
        >
            <template #icon>
                <IconFront iconName="active" size="small" />
            </template>
        </ContextMenuItem>
        <ContextMenuItem
            label="冻结"
            
        >
            <template #icon>
                <IconFront iconName="frezone" size="small" />
            </template>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem label="表格" @click="onClick(`table`, 0, tag)">
            <template #icon>
                <IconFront iconName="import" size="small" />
            </template>
        </ContextMenuItem>
    </ContextMenu>
</template>

<style></style>
