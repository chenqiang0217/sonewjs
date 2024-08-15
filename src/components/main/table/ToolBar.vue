<script setup>
import * as XLSX from 'xlsx/xlsx.mjs'

const props = defineProps({
    data: {
        type: Object,
        required: true,
    }
})

const exportExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'export')
    XLSX.writeFile(workbook, 'export.xlsx', { compression: true })
}
</script>

<template>
    <div style="position: absolute; right: 10px; z-index: 1;">
        <el-tooltip content="复制" placement="bottom" effect="light">
            <el-button @click="" disabled>
                <div class="iconFront">
                    <IconFront iconName="copy" size="small"></IconFront>
                </div>
            </el-button>
        </el-tooltip>
        <el-tooltip content="下载" placement="bottom" effect="light">
            <el-button @click="() => exportExcel(data)" :disabled="data.length == 0">
                <div class="iconFront">
                    <IconFront iconName="download" size="small"></IconFront>
                </div>
            </el-button>
        </el-tooltip>
    </div>
</template>

<style scoped>
.el-tooltip {
    height: 16px;
}

.el-button {
    margin: 0;
    padding: 0 5px;
    border: 0;
    height: 16px;
}

.iconFront {
    color: var(--el-color-primary-light-3);
}
</style>