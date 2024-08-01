<script setup>
import { ref, onMounted, computed } from 'vue'
import { useView } from '../../../api/view/index'
import { useStatusStore } from '../../../stores/status'
import { useModelStore } from '../../../stores/model'
import { useAnimation } from '../../top/solution/solution'


const status = useStatusStore()
onMounted(() => {
    const view = useView()
    view.useModel = useModelStore
    view.watchNodeTypeChange()
})

const play = () => {
    const animation = useAnimation()
    animation.index = status.task.view.index
    animation.play()
}
const pause = () => {
    const animation = useAnimation()
    animation.pause()
}
const stop = () => {
    const animation = useAnimation()
    animation.stop()
}
const toolBars = [
    {
        label: '播放',
        icon: 'play',
        action: play,
    },
    {
        label: '暂停',
        icon: 'pause-fill',
        action: pause,
    },
    {
        label: '停止',
        icon: 'stop',
        action: stop,
    }
]
const sumFrame = computed(() => {
    return status.task.view.index * status.task.view.animation.frameRate
})
const curFrame = computed(() => {
    return status.task.view.animation.index * status.task.view.animation.frameRate + status.task.view.animation.iFrame
})
const showTime = ref(true)
</script>
<template>
    <!-- 必须加div包裹canvas,并设置其宽度为100%，因为canvas是有高宽比例的 -->
    <div class="wrapper" v-loading="status.view.loading">
        <canvas id="canvas"></canvas>
        <div class="animation" v-if="status.task.view.animation.show">
            <template v-for="(toolBar, i) in toolBars" v-bind:key="i">
                <el-tooltip :content="toolBar.label" placement="bottom" effect="light">
                    <el-button @click="toolBar.action" :class="toolBar.active ? 'active' : ''">
                        <div class="iconFront">
                            <IconFront :iconName="toolBar.icon"></IconFront>
                        </div>
                    </el-button>
                </el-tooltip>
            </template>
            <el-progress :percentage="sumFrame == 0 ? 0 : Number.parseInt(curFrame * 100 / sumFrame)">
                <el-button text v-if="showTime == true" @click="showTime = !showTime">{{
                    (Math.floor(curFrame / 3600) < 10 ? ('0' + Math.floor(curFrame / 3600)) : Math.floor(curFrame /
                        3600)) + ':' + (Math.floor(curFrame / 60) % 60 < 10 ? ('0' + Math.floor(curFrame / 60) % 60) :
                            Math.floor(curFrame / 60) % 60) + '/' + (Math.floor(sumFrame / 3600) < 10 ? ('0' +
                                Math.floor(sumFrame / 3600)) : Math.floor(sumFrame / 3600)) + ':' + (Math.floor(sumFrame / 60) %
                                    60 < 10 ? ('0' + Math.floor(sumFrame / 60) % 60) : Math.floor(sumFrame / 60) % 60)
                }}</el-button>
                <el-button text v-else @click="showTime = !showTime">
                    {{ status.task.view.animation.index + '/' + status.task.view.index }}
                </el-button>
            </el-progress>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    position: absolute;
}

canvas {
    width: 100%;
    height: 100%;
}

.animation {
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;
    margin: 0 100px;
    display: flex;
    justify-content: center;
    background-color: var(--el-color-white);
}

.el-button {
    height: 22px;
    margin: 0px 1px;
    padding: 0 2px;
    border-radius: var(--el-border-radius-base);
}

.active {
    background-color: var(--el-button-hover-bg-color) !important;
}

.iconFront {
    color: var(--el-color-primary-light-3);
}

.el-progress {
    width: 100%;

}

.el-text {
    color: var(--el-color-primary);
}
</style>
