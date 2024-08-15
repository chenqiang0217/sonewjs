<script setup>
const toolBars = [
    {
        label: '导入excel',
        icon: 'filetype-xls',
        action: () => {
                document.getElementById('xlsxFile').click()
            }
    },
    {
        label: '导入midas',
        icon: 'filetype-mgb',
        action: () => {
                document.getElementById('xlsxFile').click()
            }
    }
]
</script>

<template>
    <div style="display: flex;">
        <template v-for="toolBar in toolBars">
            <el-tooltip
                :content="toolBar.label"
                placement="bottom"
                effect="light">
                <el-button
                    @click="() => toolBar.action()"
                    :disabled="toolBar.disabled">
                    <div class="iconFront">
                        <IconFront :iconName="toolBar.icon"></IconFront>
                    </div>
                </el-button>
            </el-tooltip>
        </template>
    </div>
</template>

<style scoped>
.el-button {
    height: 28px;
    margin: 2px 1px;
    padding: 0 5px;
    border-radius: var(--el-border-radius-base);
}

.iconFront {
    display: flex;
    align-items: end;
    color: var(--el-color-primary-light-3);
}
</style>
