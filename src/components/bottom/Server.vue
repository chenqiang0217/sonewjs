<script setup>
import { ref, onMounted } from 'vue';
import { useMessageStore, Message } from '../../stores/message'

const scrollbar = ref()
const message = ref()
const messages = useMessageStore()
const to = 'server'
onMounted(() => {
    const resizeObserver = new ResizeObserver(() => {
        scrollbar.value?.setScrollTop(message.value.clientHeight)
    })
    resizeObserver.observe(message.value)
})
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
            <div v-for="message in messages[to]">
                <el-text :type="Object.values(Message.TYPES).find(item => item.LEVEL == message.level).NAME"
                    class="animation" v-if="message.animation && message === messages[to].at(-1)">
                    {{ message.text }}
                </el-text>
                <el-text :type="Object.values(Message.TYPES).find(item => item.LEVEL == message.level).NAME" v-if="!message.animation">
                    <IconFront :iconName="Object.values(Message.TYPES).find(item => item.LEVEL == message.level).NAME"
                        size="small" />
                    {{ message.text }}
                </el-text>
            </div>
        </div>
    </el-scrollbar>
</template>

<style lang='scss' scoped>
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

.el-text {
    font-family: "JetBrains Mono Regular";
}

.el-scrollbar {
    padding-left: 8px;
}


.animation {
    overflow: hidden;
    white-space: nowrap;
    display: block;
    width: max-content;
    position: relative;

    &::before,
    &::after {
        content: '';
        position: absolute;
        left: 0%;
        height: 100%;
        width: 100%;
        background-color: var(--el-bg-color);
        animation: typing 3s steps(6, start) 0.5s infinite normal forwards;
    }

    &::after {
        width: 2px;
        border-radius: 2em;
        background-color: var(--el-color-primary);
        animation: typing 3s steps(6, start) 0.5s infinite normal forwards, flashing 0.5s ease-out forwards infinite;
    }
}

@keyframes typing {
    to {
        left: 100%;
    }
}

@keyframes flashing {

    to {
        opacity: 0;
    }
}
</style>