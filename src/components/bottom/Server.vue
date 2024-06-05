<script setup>
import { useMessageStore } from '../../stores/message'
import { Message } from '../../api/message'

const messages = useMessageStore()
const icons = [
    { level: Message.LEVEL.INFO, type: 'info', name: 'about', color: '#909399' },
    { level: Message.LEVEL.SUCCESS, type: 'success', name: 'sucess', color: '#67C23A' },
    { level: Message.LEVEL.WARNING, type: 'warning', name: 'caution', color: '#E6A23C' },
    { level: Message.LEVEL.ERROR, type: 'danger', name: 'error', color: '#F56C6C' }
]
</script>

<template>
    <el-scrollbar>
        <div v-for="message in messages.server">
            <div>
                <el-text :type="icons.find(item => item.level == message.level).type">
                    <IconFront :iconName="icons.find(item => item.level == message.level).name"
                        :color="icons.find(item => item.level == message.level).color" size="small"></IconFront>
                    {{ message.text }}
                </el-text>
            </div>
        </div>
    </el-scrollbar>
</template>

<style scoped>
div {
    font-size: 14px;
}

.info {
    color: rgb(51, 49, 49);
}

.su {
    color: rgb(51, 49, 49);
}
</style>