<script setup>
import { useMessageStore } from '../../stores/message'

const messages = useMessageStore()
</script>

<template>
    <el-scrollbar>
        <!-- <el-alert v-for="message in messages" :title="message.text" :type="message.type" show-icon></el-alert> -->
        <p v-for="message in messages.server">{{ '[' + message.time + '] ' + message.content  }}</p>
    </el-scrollbar>
</template>

<style></style>