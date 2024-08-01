<script setup>
import { ref, watch } from 'vue'
import { useStatusStore } from '../../../stores/status'
import { useMessageStore, Message } from '../../../stores/message'
import { auth } from '../../../api/request'
import Modal from '../Modal.vue'

const status = useStatusStore()
const messages = useMessageStore()
const to = 'client'
const width = 360

</script>

<template>
    <Modal title="" :width="width">
    </Modal>
</template>

<style scoped>
.inactive {
    color: var(--el-text-color-regular);
}

.el-link {
    font-size: 12px;
}
</style>
