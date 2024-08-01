<script setup>
import { useStatusStore } from '../../stores/status'
const status = useStatusStore()
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    width: {
        type: Number,
        required: true
    },
    apply: {
        type: String,
        default: '运用'
    }
})
</script>

<template>
    <el-dialog v-model="status.ui.modal.show" :title="title" :width="width" draggable class="dialog">
        <slot></slot>
        <div class="footer">
            <slot name="footer">
                <!-- <el-button type="primary" round @click="status.ui.modal.show = false"><el-text>
                        关闭
                    </el-text></el-button> -->
                <el-button type="primary" round @click="status.ui.modal.apply = true">
                    <el-text>
                        {{ props.apply }}
                    </el-text></el-button>
            </slot>
        </div>
    </el-dialog>
</template>

<style lang="scss" scoped>
.footer {
    flex: 1;
    display: flex;
    justify-content: space-around;
    margin-top: 32px;

    .el-button {
        background: var(--el-color-primary-light-7);
        height: 2em;
        display: flex;
        align-items: center;
        max-width: 160px;
        width: 100%;

        .el-text {
            color: var(--el-color-primary);
        }

        &:hover {
            background: var(--el-color-primary);

            .el-text {
                color: var(--el-color-primary-light-7);
            }

            .el-text.close:hover {
                color: var(--el-color-primary-light-5);
            }
        }
    }
}
</style>
