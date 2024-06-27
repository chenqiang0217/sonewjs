<script setup>
import { ref, onMounted } from 'vue'
import { useMessageStore, Message } from '../../stores/message'
import { Commander } from './commander'
import Code from './Code.vue'

const scrollbar = ref()
const message = ref()
const code = ref()
const splited = ref(false)
const messages = useMessageStore()
const to = 'client'
onMounted(() => {
    const resizeObserver = new ResizeObserver(() => {
        scrollbar.value?.setScrollTop(message.value.clientHeight)
    })
    resizeObserver.observe(message.value)
    messages.add({
        text: 'sonew 0.1.0',
        level: Message.TYPES.INFO.LEVEL,
        to,
    })
})
const execute = async (code) => {
    messages.add({
        text: code,
        level: Message.TYPES.COMMANDER.LEVEL,
        to,
    })
    try {
        const commander = new Commander(code)
        commander.execute()
        messages.add({
            text: '执行完成',
            level: Message.TYPES.SUCCESS.LEVEL,
            to
        })
    } catch (error) {
        messages.add({
            text: '执行错误\n' + error?.message,
            level: Message.TYPES.ERROR.LEVEL,
            to
        })
    }
}
const newWindow = () => {
    window.open('/editor', '_blank', 'popup')
    const channel = new BroadcastChannel('sonewEditor')
    channel.onmessage = function (event) {
        switch (event.data.action) {
            case 'createWindow':
                channel.postMessage({
                    action: 'editorInit',
                    value: code.value.getDoc()
                })
                break
            case 'closeWindow':
                splited.value = false
                channel.close()
                break
            case 'submit':
                execute(event.data.value)
                break
        }
    }
    splited.value = true
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
        <el-tooltip content="新窗口" placement="bottom" effect="light">
            <el-button @click="newWindow()" :disabled="splited">
                <div class="iconFront">
                    <IconFront iconName="split" size="small"></IconFront>
                </div>
            </el-button>
        </el-tooltip>
    </div>
    <el-scrollbar ref="scrollbar" always>
        <div class="message" ref="message">
            <div v-for="(message, i) in messages[to]" style="border: 1px;">
                <template v-if="message.level == Message.TYPES.COMMANDER.LEVEL">
                    <Code :doc="message.text" :id="'codeContainer-' + i" />
                </template>
                <div v-else>
                    <div v-for="line in message.text.split('\n')">
                        <el-text :type="Object.values(Message.TYPES).find(item => item.LEVEL == message.level).NAME">
                            <IconFront
                                :iconName="Object.values(Message.TYPES).find(item => item.LEVEL == message.level).NAME"
                                size="small">
                            </IconFront>
                            {{ line }}
                        </el-text>
                    </div>
                </div>
            </div>
        </div>
    </el-scrollbar>
    <Code id="codeContainer" ref="code" v-show="!splited" :editable="true" @execute="execute" />
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

.el-text {
    font-family: "JetBrains Mono";
}
</style>