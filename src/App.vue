<script setup>
import { ref, onMounted } from 'vue'
import Top from './components/top/Top.vue'
import Main from './components/main/Main.vue'
import Right from './components/right/Right.vue'
import Bottom from './components/bottom/Bottom.vue'
import Divider from './components/Divider.vue'

const minimalWidth = 250
const minimalHeight = 100
const refTop = ref(null)
const refBottom = ref(null)
const refMain = ref(null)
const refRight = ref(null)
const mainWidth = ref(0)
const mainHeight = ref(0)
const disableBottom = ref(false)
const disableRight = ref(false)

onMounted(() => {
    const rightObserver = new ResizeObserver(() => {
        if (refRight.value
            && refRight.value.clientWidth >= document.documentElement.clientWidth - minimalWidth) {
            disableRight.value = true
        }
        else {
            disableRight.value = false
        }
    })
    const bottomObserver = new ResizeObserver(() => {
        if (refBottom.value
            && refTop.value
            && refBottom.value.clientHeight >= document.documentElement.clientHeight - refTop.value.clientHeight - minimalHeight) {
            disableBottom.value = true
        }
        else {
            disableBottom.value = false
        }
    })
    const mainObserver = new ResizeObserver(() => {
        if(refMain.value){
            mainWidth.value = refMain.value.clientWidth
            mainHeight.value = refMain.value.clientHeight
        }
    })
    rightObserver.observe(refRight.value)
    bottomObserver.observe(refBottom.value)
    mainObserver.observe(refMain.value)
})
</script>

<template>
    <div class="container">
        <div class="top" ref="refTop">
            <Top />
        </div>
        <div class="main" ref="refMain">
            <Main :w="mainWidth" :h="mainHeight" />
        </div>
        <div class="bottom" ref="refBottom">
            <Divider top :height="200" :disable="disableBottom">
                <Bottom />
            </Divider>
        </div>
        <div class="right" ref="refRight">
            <Divider left :width="250" :disable="disableRight">
                <Right />
            </Divider>
        </div>
    </div>
</template>

<style scoped>
* {
    margin: 0px;
    padding: 0px;
}

.container {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
        'header header'
        'main   right'
        'bottom right';
    height: 100%;
    width: 100%;
}

.top {
    grid-area: header;
    display: flex;
    flex-wrap: wrap;
    border-bottom: 1px solid #DCDFE6;
}

.main {
    grid-area: main;
    overflow: hidden;
}

.bottom {
    grid-area: bottom;
}

.right {
    grid-area: right;
}
</style>
