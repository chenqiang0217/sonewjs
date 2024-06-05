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
            <p
                v-for="(message, i) in messages.client"
                v-bind:key="i"
            >
                {{ '[' + message.time + '] ' + message.text }}
            </p>
        </div>
    </el-scrollbar>
    <!-- <el-input
        v-model="input"
        placeholder="请输入内容"
        clearable
        @keyup.enter="submit"
    ></el-input> -->
    <input
        type="text"
        v-model="input"
        @keyup.enter="submit"
    />
</template>
<style scoped>
.align-items-end {
    max-height: 100%;
    position: absolute;
    bottom: 0;
    font-size: 14px;
}
.scroll-wrap {
    height: 100%;
}
.view-wrap {
    height: 100%;
    position: relative;
}
input {
    height: 30px;
    margin: 0 10px;
    border-radius: 5px;
}
input:focus{
    border: 1px solid var(--el-color-primary);
}
::v-deep(.el-input__wrapper) {
    padding: 0;
    border: 0;
}
::v-deep(.el-input__inner) {
    border-radius: 15px;
    padding: 0;
    border: 1px solid var(--el-color-primary-light-7);
}
</style>
