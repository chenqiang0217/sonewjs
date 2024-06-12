<script setup>
import { ref, onMounted, computed, watch } from 'vue';

const props = defineProps({
    delay: {
        type: Number,
        default: 5.0,
    },
    width: {
        type: Number,
        default: 500,
    }
})
const emit = defineEmits(['timeOut'])
const timer = ref(null)
const interval = 0.5
const percentage = ref(0)
const countdown = ref(props.delay)
function countdownTimer() {
    if (countdown.value > 0) {
        countdown.value -= 0.5
        percentage.value = (1.0 - countdown.value / props.delay) * 100
    } else {
        clearTimeout(timer.value)
    }
}
onMounted(() => {
    timer.value = setInterval(countdownTimer, interval * 1000)
})
const format = () => {
    return ''
}
const status = computed(() => countdown.value > 0 ? 'warning' : 'success')
const show = ref(true)
watch(countdown, (countdown) => {
    if (countdown == 0.0) {
        setTimeout(() => {
            show.value = false
        }, interval * 2 * 1000)
    }
})
</script>

<template>
    <div :style="{ width: width + 'px' }" v-show="show">
        <el-progress :percentage="percentage" :format="format" :stroke-width="8" :status="status"></el-progress>
    </div>
</template>