<script setup>
import { useMessageStore } from '../../stores/message'
import { Message } from '../../api/message'

const messages = useMessageStore()
const icons = [
    {level: Message.LEVEL.INFO, name: 'about'},
    {level: Message.LEVEL.SUCCESS, name: 'sucess'},
    {level: Message.LEVEL.WARNING, name: 'caution'},
    {level: Message.LEVEL.ERROR, name: 'error'}
]
</script>

<template>
    <el-scrollbar>
        <div v-for="message in messages.server">
            <div>
                <IconFront :iconName="icons.find(item => item.level == message.level).name" color="black" size="small"></IconFront>
                {{ message.text }}
            </div>
        </div>
    </el-scrollbar>
</template>

<style scoped>
div {
    font-size: 14px;
}
</style>