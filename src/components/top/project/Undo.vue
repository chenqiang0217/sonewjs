<script setup>
import { ref, watch } from 'vue'
import { useCommandStore } from '../../../api/command/index'
import Empty from '../../main/table/Empty.vue'

const commands = useCommandStore()
const checkedCommands = ref([])
const undoCommands = ref([])
watch(() => commands.currentStep, currentStep => {
    undoCommands.value = commands.commandQueue.slice(0, currentStep + 1).reverse()
}, { immediate: true })

const handleChecked = (index, checkedCommands) => {
    checkedCommands.splice(0, checkedCommands.length)
    for (let i = 0; i <= index; i++) {
        checkedCommands.push(i)
    }
}
const onClick = (steps) => {
    commands.undo(steps)
    checkedCommands.value.splice(0, checkedCommands.value.length)
}

</script>

<template>
    <div style="width: 200px; margin: 10px;">
        <el-checkbox-group v-model="checkedCommands" v-if="undoCommands.length !== 0" style="min-height: 200px;">
            <div v-for="(command, i) in undoCommands" style="margin-bottom: 2px;">
                <el-checkbox :key="i" :label="(i + 1) + ': ' + command.label" :value="i"
                    @change="() => handleChecked(i, checkedCommands)" />
            </div>
        </el-checkbox-group>
        <Empty v-else />
        <el-button type="primary" plain round @click="onClick(checkedCommands.length)" :disabled="checkedCommands.length == 0">
                撤销
        </el-button>
    </div>
</template>

<style scoped>
.el-button {
    height: 2em;
    display: flex;
    align-items: center;
    max-width: 120px;
    width: 100%;
    margin: auto;
}
</style>
