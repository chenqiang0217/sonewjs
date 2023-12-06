<script setup>
import { computed } from 'vue'
import { useStatusStore } from '../../stores/status'
const status = useStatusStore()
const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    left: {
        type: Number,
        default: 10
    },
    top: {
        type: Number,
        default: 100
    },
    width: {
        type: Number,
        required: true
    }
})
const position = computed(() => ({
    left: props.left + 'px',
    top: props.top + 'px',
    width: props.width + 'px'
}))
</script>

<template>
    <Teleport to="body">
        <div
            class="dialog"
            :style="position"
            v-drag
            v-show="show"
        >
            <div class="header">
                <p>{{ title }}</p>
            </div>
            <div class="modal"><slot></slot></div>
            <div class="dialog-submit-wrapper">
                <el-button
                    type="primary"
                    plain
                    @click="status.ui.dialog.apply = true"
                >
                    应用</el-button
                >
                <el-button
                    type="primary"
                    plain
                    @click="status.ui.dialog.show = false"
                    >关闭</el-button
                >
            </div>
        </div>
    </Teleport>
</template>

<style lang="scss" scoped>
.dialog {
    position: fixed;
    z-index: 10;
    background: white;
    border: 1px solid var(--el-color-primary-light-7);
    /* box-shadow: 0 1px 2px rgba(0, 0, 0, .12), 0 0 2px rgba(0, 0, 0, .04); */
}
.header {
    background: var(--el-color-primary-light-7);
    height: 2em;
    display: inline-flex;
    align-items: center;
    width: 100%;
    padding-left: 10px;
}
.header:hover {
    background: var(--el-color-primary);
    p {
        color: white;
    }
}
.dialog .modal {
    padding: 10px;
    padding-bottom: 0;
}
</style>
