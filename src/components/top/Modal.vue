<script setup>
import { useStatusStore } from '../../stores/status'
import CdButton from '../utils/CdButton.vue'

const status = useStatusStore()
const props = defineProps({
    width: {
        type: Number,
        required: true
    },
    apply: {
        type: String,
        default: '运用'
    },
    countdown: {
        type: Number,
        default: 0
    }
})

</script>

<template>
    <el-dialog v-model="status.ui.modal.show" :width="width" draggable>
        <slot></slot>
        <div class="footer">
            <slot name="footer">
                <CdButton
                    :label="props.apply"
                    :countdown="props.countdown"
                    class="cd-button"
                    @click="status.ui.modal.apply = true" />
            </slot>
        </div>
    </el-dialog>
</template>

<style lang="scss" scoped>
.footer {
    display: flex;
    justify-content: space-around;
}

</style>
