<script setup>
import { onMounted, watch } from 'vue'
import { createScene, resetViewRatio } from '../../stores/view'
import { useStatusStore } from "../../stores/status"
import { debounce } from "../../api/utils"

const props = defineProps({
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
})
const status = useStatusStore()

onMounted(() => {
    createScene(canvas)
    watch(() => ({ width: props.width, height: props.height }), ({ width, height }) => {
        status.view.size.width = width
        status.view.size.height = height
        debounce(function () {
            resetViewRatio({ width, height })
        })()
    }, { deep: true })
})

</script>

<template>
    <!-- 必须加div包裹canvas,并设置其宽度为100%，因为canvas是有高宽比例的 -->
    <div id="canvasWrapper" v-loading="status.view.loading">
        <canvas id="canvas" :width="width" :height="height"></canvas>
    </div>
</template>

<style scoped>
div {
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
</style>