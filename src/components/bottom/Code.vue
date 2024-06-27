<script setup>
import { ref, onMounted } from 'vue'
import { minimalSetup, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers, highlightActiveLineGutter, keymap } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
// import { espresso } from 'thememirror'


const props = defineProps({
    doc: {
        type: String,
        default: '',
    },
    id: {
        type: String,
        required: true,
    },
    editable: {
        type: Boolean,
        default: false,
    }
})
const emit = defineEmits(['execute'])
const button = ref()
let view
onMounted(() => {
    const theme = EditorView.theme({
        '&': {
            fontFamily: 'JetBrains Mono, HarmonyOS Sans SC, Consolas, Courier New, monospace',
            fontSize: '14px',
            backgroundColor: props.editable ? '#F2F6FC' : '#FFFFFF'
        }
    })
    const extensions = [
        minimalSetup, lineNumbers(), highlightActiveLineGutter(), javascript(), theme,
        EditorView.editable.of(props.editable),
    ]
    // if (props.editable) {
    //     extensions.push(
    //         keymap.of([{ key: 'Ctrl-C-Enter', mac: 'Cmd-Enter', run: button.value.click, preventDefault: true, stopPropagation: true }])
    //     )
    // }
    const state = EditorState.create({
        doc: props.doc,
        extensions
    })
    view = new EditorView({
        state,
        parent: document.getElementById(props.id),
    })
    if (props.editable) {
        const timer = setInterval(() => {
            view.focus()
            const line = view.state.doc.line(1)
            view.dispatch({
                selection: { head: line.to, anchor: line.to },
                scrollIntoView: true
            })
            if (view.hasFocus) clearInterval(timer)
        }, 500)
    }
})
const onClick = () => {
    emit('execute', view.state.doc.toString())
    view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: props.doc }
    })
}
const getDoc = () => {
    return view.state.doc.toString()
}
defineExpose({ getDoc })
</script>

<template>
    <div style="display: flex;">
        <div :id="id" style="flex: 1;"></div>
        <template v-if="editable">
            <el-tooltip content="运行" placement="top" effect="light">
                <el-button style="height: 100%;" type="primary" size="small" ref="button" plain
                    @click="onClick">
                    <IconFront iconName="submit2"></IconFront>
                </el-button>
            </el-tooltip>
        </template>
    </div>
</template>

<style>
.el-button {
    border: 0;
    border-radius: 0;
}
</style>
