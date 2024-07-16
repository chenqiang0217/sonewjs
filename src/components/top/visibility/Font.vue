<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    family: {
        type: String,
        default: 'JetBrains Mono Regular'
    },
    size: {
        type: Number,
        default: 12
    },
    color: {
        type: String,
        default: '#000000'
    }
})
const emit = defineEmits(['change'])
const font = ref({
    family: props.family,
    size: props.size,
    color: props.color
})
watch(font, font => {
    emit('change', font)
}, { immediate: true, deep: true })
const fontFamily = ref()
window.queryLocalFonts().then((value) => {
    fontFamily.value = value.filter(item => item.style === 'Regular')
})
</script>

<template>
    <div style="flex:1" class="fontConfig">
        <el-form-item>
            <el-col :span="8"><el-text>字体：</el-text></el-col>
            <el-col :span="16"> <el-select v-model="font.family" placeholder="选择类型">
                    <el-option v-for="({ fullName }, index) in fontFamily" :label="fullName" :value="fullName"
                        :key="index"></el-option>
                </el-select></el-col>
        </el-form-item>
        <el-form-item>
            <el-col :span="8"><el-text>字体大小：</el-text></el-col>
            <el-col :span="16"><el-input-number v-model="font.size" :min="1" :max="50" /></el-col>
        </el-form-item>
        <el-form-item>
            <el-col :span="8"><el-text>字体颜色：</el-text></el-col>
            <el-col :span="16"> <el-color-picker v-model="font.color" style=" width:100%;display: block;" /></el-col>
        </el-form-item>
    </div>
</template>

<style lang="scss">
.fontConfig {
    .el-input-number {
        width: 100%;
    }

    .el-color-picker__trigger {
        width: 100%;
        /* margin: 0; */
        padding: 0;
        border: 0;

        .el-color-picker__color {
            border: 0;

            .el-color-picker__color-inner {
                justify-content: end;
                border-radius: var(--el-border-radius-base);

                .el-color-picker__icon {
                    margin-right: 10px;
                }
            }
        }
    }
}
</style>
