<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    color: {
        type: String,
        default: '#000000'
    },
    disabled: {
        type: Boolean,
        default: false
    },
})
const emit = defineEmits(['change'])
const color = ref(props.color)
watch(color, color => {
    emit('change', color)
}, { deep: true })
</script>

<template>
    <el-color-picker v-model="color" :disabled="disabled" class="color"
        style=" width:10px;height:18px;display: block;" />
</template>

<style lang="scss">
.color {
    .el-color-picker__mask {
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

    .el-color-picker__trigger {
        width: 100%;
        height: 100%;
        padding: 0;
        border: 0;

        .el-color-picker__color {
            border: 0;
            height: 100%;

            .el-color-picker__color-inner {
                justify-content: end;
                border-radius: var(--el-border-radius-base);
                height: 100%;

                .el-color-picker__icon {
                    margin: 0 auto;
                    display: none;
                }
            }
        }
    }
}
</style>
