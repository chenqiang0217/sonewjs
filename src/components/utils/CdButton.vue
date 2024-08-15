<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
const props = defineProps({
    type: {
        type: String,
        default: 'primary'
    },
    link: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        required: true
    },
    countdown: {
        type: Number,
        default: 0
    },
    disabled: {
        type: Boolean,
        default: false
    }
})
let timer
const countdown = ref(0)
const onClick = () => {
    countdown.value = props.countdown
    if (props.countdown != 0) {
        timer = setInterval(() => {
            if (countdown.value > 0) {
                countdown.value -= 1
            } else {
                clearCountdown()
            }
        }, 1000)
    }
}
const clearCountdown = () => {
    clearInterval(timer)
    timer = null
    countdown.value = 0
}
onBeforeUnmount(() => {
    clearCountdown()
})

const label = computed(
    () =>
        props.label +
        (props.countdown && countdown.value !== 0
            ? ' (' + countdown.value + ')'
            : '')
)
</script>

<template>
    <el-button
        :type="props.type"
        :link="props.link"
        :size="props.link?'small':'default'"
        plain
        round
        :disabled="countdown !== 0 || props.disabled"
        @click="() => onClick()">
        {{ label }}
    </el-button>
</template>

<style scoped>
</style>
