<script setup>
import { ref, onMounted } from 'vue';
import { useMessageStore, Message } from '../../stores/message'
import Timer from './Timer.vue'

const scrollbar = ref()
const message = ref()
const timers = ref([])
const messages = useMessageStore()
const to = 'server'
onMounted(() => {
    const resizeObserver = new ResizeObserver(() => {
        scrollbar.value?.setScrollTop(message.value.clientHeight)
    })
    resizeObserver.observe(message.value)
})
const timeOut = (event) => {
    event.target.style.visibility = "hidden";
}
</script>

<template>
    <div style="margin: 0 5px 0 auto;">
        <el-tooltip content="清空" placement="bottom" effect="light">
            <el-button @click="messages.clear(to)">
                <div class="iconFront">
                    <IconFront iconName="clear" size="small"></IconFront>
                </div>
            </el-button>
        </el-tooltip>
        <el-tooltip content="复制" placement="bottom" effect="light">
            <el-button @click="">
                <div class="iconFront">
                    <IconFront iconName="copy" size="small"></IconFront>
                </div>
            </el-button>
        </el-tooltip>
    </div>
    <el-scrollbar ref="scrollbar" always>
        <div ref="message">
            <div class="message" v-for="(message, index) in messages[to]">
                <el-text :type="Object.values(Message.TYPES).find(item => item.LEVEL == message.level).NAME">
                    <IconFront :iconName="Object.values(Message.TYPES).find(item => item.LEVEL == message.level).NAME"
                        size="small">
                    </IconFront>
                    {{ message.text }}
                </el-text>
                <Timer style="margin-left: 5px;" v-if="message.delay" :delay="message.delay" ref="timers"
                    @timeOut="timeOut(index)" />
            </div>
        </div>
    </el-scrollbar>
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

.message {
    display: flex;
}

.el-text {
    font-family: "JetBrains Mono";
}
</style>