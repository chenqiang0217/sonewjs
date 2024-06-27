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
        <div class="dialog" :style="position" v-drag v-show="show">
            <div class="header">
                <el-text size="large" style="padding-left: 10px;">{{ title }}</el-text>
            </div>
            <div class="modal">
                <slot></slot>
            </div>
            <div class="dialog-submit-wrapper">
                <el-button type="primary" round @click="status.ui.dialog.show = false"><el-text>
                        关闭
                    </el-text></el-button>
                <el-button type="primary" round @click="status.ui.dialog.apply = true">
                    <el-text>
                        应用
                    </el-text></el-button>
            </div>
        </div>
    </Teleport>
</template>

<style lang="scss" scoped>
.dialog {
    position: fixed;
    z-index: 10;
    background: var(--el-color-white);
    border: 1px solid var(--el-color-primary-light-7);
    box-shadow: var(--el-box-shadow-light);
}

.header,
.el-button {
    background: var(--el-color-primary-light-7);
    height: 2em;
    display: inline-flex;
    align-items: center;
    width: 100%;

    .el-text {
        color: var(--el-color-primary);
    }
}

.el-button {
    max-width: 160px;
}

.header:hover,
.el-button:hover {
    background: var(--el-color-primary);

    .el-text {
        color: var(--el-color-primary-light-7);
    }
}

.dialog-submit-wrapper {
    flex: 1;
    display: flex;
    justify-content: space-around;
    margin: 10px 10px;
}

.modal {
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
