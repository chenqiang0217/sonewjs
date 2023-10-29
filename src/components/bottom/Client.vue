<script setup>
import { ref } from 'vue'
import { useMessageStore } from '../../stores/message'

const messages = useMessageStore()
const input = ref()
const submit = () => {
    messages.add({ to: 'client', level: 'info', content: input.value })
    input.value = ''
}

</script>

<template>
    <el-scrollbar
        always
        noresize
        wrap-class="scroll-wrap"
        view-class="view-wrap"
    >
        <div class="align-items-end">
            <p v-for="message in messages.client">
                {{ '[' + message.time + '] ' + message.content }}
            </p>
        </div>
    </el-scrollbar>
    <el-input
        v-model="input"
        placeholder="请输入内容"
        @keyup.enter="submit"
    ></el-input>
</template>
<style scoped>
.align-items-end {
    max-height: 100%;
    position: absolute;
    bottom: 0;
}
.scroll-wrap {
    height: 100%;
}
.view-wrap {
    height: 100%;
    position: relative;
}
</style>
