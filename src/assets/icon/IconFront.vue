<template>
    <svg class="icon" aria-hidden="true">
        <use :xlink:href="'#icon-' + iconName" />
    </svg>
</template>
<script setup>
import { computed } from 'vue'
import './iconfont.js'
const props = defineProps({
    iconName: {
        type: String,
        default: '',
    },
    color: {
        type: String,
        default: '#7a5ba9',
    },
    size: {
        type: String,
        default: 'medium',
        validator(value) {
            return ['big', 'medium', 'small'].includes(value)
        }
    },
    suffix: {
        type: Boolean,
        default: false
    }
})
const size = computed(() => {
    switch (props.size) {
        case 'big':
            return props.suffix ? '10px' : '30px'
        case 'medium':
            return props.suffix ? '10px' : '18px'
        case 'small':
            return props.suffix ? '0.5em' : '1em'
    }
})
</script>
<style scoped>
.icon {
    width: v-bind('size');
    height: v-bind('size');
    position: relative;
    vertical-align: -2px;
    /* fill: v-bind('props.color'); */
    /* fill: var(--el-color-primary-light-3); */
    fill: currentColor;
}
</style>