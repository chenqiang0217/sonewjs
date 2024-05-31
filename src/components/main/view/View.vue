<script setup>
import { onMounted } from 'vue'
import { useView } from '../../../api/view/index'
import { useStatusStore } from '../../../stores/status'
import { useModelStore } from '../../../stores/model'



const status = useStatusStore()
onMounted(() => {
    const view = useView()
    const config = view.scene.metadata.useConfig()
    config.canvas = `canvas`
    view.model = useModelStore
})
</script>

<template>
    <!-- 必须加div包裹canvas,并设置其宽度为100%，因为canvas是有高宽比例的 -->
    <div
        id="canvasWrapper"
        v-loading="status.view.loading"
    >
        <canvas id="canvas"></canvas>
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
