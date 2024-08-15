<script setup>
import { computed } from 'vue'
import { useStatusStore } from '../../stores/status'
import CdButton from '../utils/CdButton.vue'
const status = useStatusStore()
const props = defineProps({
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
    },
    countdown: {
        type: Number,
        default: 3
    }
})
const position = computed(() => ({
    left: props.left + 'px',
    top: props.top + 'px',
    width: props.width + 'px'
}))
</script>

<template>
    <div class="dialog" :style="position" v-drag>
        <div class="header">
            <slot name="header">
                <el-text tag="b" style="margin-right: auto">{{
                    title
                }}</el-text>
                <el-text class="close">
                    <IconFront
                        iconName="close"
                        @click="status.ui.dialog.show = false" />
                </el-text>
            </slot>
        </div>
        <div class="body">
            <slot></slot>
        </div>
        <div class="footer">
            <slot name="footer">
                <CdButton
                    label="关闭"
                    class="cd-button"
                    @click="status.ui.dialog.show = false" />
                <CdButton
                    label="应用"
                    class="cd-button"
                    :countdown="props.countdown"
                    @click="status.ui.dialog.apply = true" />
            </slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.dialog {
    position: fixed;
    z-index: 10;
    background: var(--el-color-white);
    // border: 1px solid var(--el-color-primary-light-9);
    // box-shadow: var(--el-box-shadow-light);
}

.header {
    background: var(--el-color-primary-light-9);
    height: 2em;
    display: flex;
    align-items: center;

    .el-text {
        color: var(--el-color-primary);
    }

    &:hover {
        background: var(--el-color-primary);

        .el-text {
            color: var(--el-color-white);
        }

        .el-text.close:hover {
            color: var(--el-color-primary-light-5);
        }
    }
}

.header {
    padding: 0 10px;
}

.footer {
    flex: 1;
    display: flex;
    justify-content: space-around;
    margin: 10px 10px;
}

.body {
    padding: 10px;
    padding-bottom: 0;

    .el-input-number {
        width: 100%;
    }

    .el-select {
        width: 100%;
    }
}
</style>
