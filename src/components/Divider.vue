<script setup>
import { ref } from 'vue'
const props = defineProps({
    width: {
        type: Number,
        required: false,
    },
    height: {
        type: Number,
        required: false,
    },
    top: {
        type: Boolean,
        default: false,
    },
    right: {
        type: Boolean,
        default: false,
    },
    bottom: {
        type: Boolean,
        default: false,
    },
    left: {
        type: Boolean,
        default: false,
    },
    disable: {
        type: Boolean,
        default: false,
    }
})

const EDGES = {
    NONE: 0,
    TOP: 1,
    RIGHT: 2,
    BOTTOM: 3,
    LEFT: 4
}
const edge = ref(EDGES.NONE)
const dragable = ref()
const sizeNow = ref({
    width: props.width,
    height: props.height
})
const minimal = {
    width: 150,
    height: 120
}

function onMouseDown(event, which) {
    document.body.style.cursor = (which == EDGES.LEFT || which == EDGES.RIGHT) ? 'ew-resize' : 'ns-resize'
    edge.value = which
    dragable.value = event.target
    document.addEventListener('mousemove', onMouseMove)
}
function onMouseMove(event) {
    const el = dragable.value
    document.addEventListener('mouseup', onMouseUp)
    if (edge.value == EDGES.TOP || edge.value == EDGES.BOTTOM) {
        let dy
        if (edge.value == EDGES.TOP) {
            dy = el.offsetTop - event.clientY
        }
        else {
            dy = event.clientY - el.offsetTop - sizeNow.value.height
        }
        if (dy <= 0.0 || !props.disable) {
            let height = sizeNow.value.height + dy
            sizeNow.value.height = height > minimal.height ? height : minimal.height
        }
    }
    else {
        let dx
        if (edge.value == EDGES.LEFT) {
            dx = el.offsetLeft - event.clientX
        }
        else {
            dx = event.clientX - el.offsetLeft - sizeNow.value.width
        }
        if (dx <= 0.0 || !props.disable) {
            let width = sizeNow.value.width + dx
            sizeNow.value.width = width > minimal.width ? width : minimal.width
        }
    }

}
function onMouseUp() {
    document.body.style.cursor = 'default'
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('mousemove', onMouseMove)
}
</script>
<template>
    <div class="container1">
        <el-divider v-if="top" @mousedown="(event) => onMouseDown(event, EDGES.TOP)" />
        <div class="container2">
            <el-divider class="vertical" direction="vertical" v-if="left"
                @mousedown="(event) => onMouseDown(event, EDGES.LEFT)" style="height: 100%;" />
            <div class="dragable"
                :style="{ 'width': (left | right) ? sizeNow.width + 'px' : '100%' + 'px', 'height': (top | bottom) ? sizeNow.height + 'px' : '100%' }">
                <slot></slot>
            </div>
            <el-divider class="vertical" direction="vertical" v-if="right"
                @mousedown="(event) => onMouseDown(event, EDGES.RIGHT)" style="height: 100%;" />
        </div>
        <el-divider v-if="bottom" @mousedown="(event) => onMouseDown(event, EDGES.BOTTOM)" />
    </div>
</template>

<style lang="scss" scoped>
.container1 {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.container2 {
    display: flex;
    flex: 1;
    width: 100%;
    height: 100%;
}

.dragable {
    flex: 1;
}

.el-divider {
    margin: 0;
}

.el-divider:not(.vertical) {
    height: 2px;
}

.el-divider.vertical {
    width: 2px;
}

.el-divider:hover:not(.vertical) {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary);
    cursor: ns-resize;
}

.el-divider:hover.vertical {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary);
    cursor: ew-resize;
}
</style>
