<script setup>
import Client from './Client.vue'
import Server from './Server.vue'
import { useStatusStore } from '../../stores/status'

const status = useStatusStore()
</script>

<template>
    <el-tabs v-model="status.ui.tab.message.active" class="footer-tabs" type="border-card" tab-position="bottom">
        <el-tab-pane name="client">
            <template #label>
                <span>
                    <IconFront iconName="interactive"></IconFront>
                    <span>命令信息</span>
                </span>
            </template>
            <Client />
        </el-tab-pane>

        <el-tab-pane name="server">
            <template #label>
                <span>
                    <IconFront iconName="network"></IconFront>
                    <span>分析信息</span>
                </span>
            </template>
            <Server />
        </el-tab-pane>
    </el-tabs>
</template>

<style scoped>
.footer-tabs {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
    border-top: 0;
    border-right: 0;
}

.footer-tabs>.el-tab-pane {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
}

::v-deep(.el-tabs__content) {
    padding: 2px 0;
}
::v-deep(.el-tabs__header, .is-bottom) {
    margin: 0;
}
::v-deep(input) {
    padding: 0 10px;
}
</style>