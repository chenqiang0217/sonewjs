<script setup>
import { ref, watch, nextTick } from 'vue'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useMessageStore, Message } from '../../../stores/message'
import {useView} from '../../../api/view/index'
import { Color3 } from '../../../api/view/index'
import Dialog from '../Dialog.vue'
import Empty from '../../main/table/Empty.vue'
import Color from '../../right/Color.vue'


const model = useModelStore()
const status = useStatusStore()
const messages = useMessageStore()
const to = 'client'
const type = {
    femType: 1,
    mat: 2,
    sec: 3
}

const options = ref([
    {
        label: '类型',
        value: type.femType,
    },
    {
        label: '材料',
        value: type.mat,
    },
    {
        label: '截面',
        value: type.sec,
    }
])
const operation = ref({ type: type.femType })
const character = ref(model.elemFemType)
watch(
    () => operation.value.type,
    (operation) => {
        switch (operation) {
            case type.femType:
                character.value = model.elemFemType
                break
            case type.mat:
                character.value = model.elemMat
                break
            case type.sec:
                character.value = model.elemSec
                break
        }
    }
)
watch(
    () => status.ui.dialog.apply,
    (apply) => {
        if (apply) {
            status.ui.dialog.apply = false
            onApply()
        }
    }
)
function onApply() {

}



const rowIndex = ref()
const cellRef = ref()
const cell = ref({
    row: void 0,
    column: void 0,
    data: void 0
})
const onRowClick = row => {
    rowIndex.value = character.value.findIndex(group => group == row)
}
const createCharacter = () => {
    const view = useView()
    const color = view.scene.metadata.constant.COLOR.MESH.ELEM.DEFAULT
    let no = 1
    const noExist = character.value.map(item => item.no).filter(item => item >= no)
    while (true) {
        const index = noExist.findIndex(item => item == no)
        if (index != -1) {
            noExist.splice(index, 1)
            no += 1
        }
        else {
            switch (operation.value.type) {
                case type.femType:
                    model.createElemFemType(no, String(no), color.clone())
                    break
                case type.mat:
                    model.createElemMat(no, String(no), color.clone())
                    break
                case type.sec:
                    model.createElemSec(no, String(no), color.clone())
                    break
            }
            break
        }
    }
}
const removeCharacter = () => {
    if (rowIndex.value !== void 0) {
        const c = character.value[rowIndex.value]
        const [key, _] = Object.entries(type).find(([key, value]) => value === operation.value.type)
        if (!model.elem.some(elem => elem[key] === c)) {
            switch (operation.value.type) {
                case type.femType:
                    model.removeElemFemType(c)
                    break
                case type.mat:
                    model.removeElemMat(c)
                    break
                case type.sec:
                    model.removeElemSec(c)
                    break
            }
            rowIndex.value -= 1
            if (rowIndex.value == -1) {
                rowIndex.value = void 0
            }
        }
    }
}
const cellEdit = (scope, cell) => {
    //cell 须不带value进行访问
    cell.row = scope.$index
    cell.column = scope.cellIndex
    cell.data = scope.row[scope.column.property]
    nextTick(() => {
        const td = cellRef.value.ref.parentNode.parentNode.parentNode.parentNode
        td.style.paddingTop = '0px'
        td.style.paddingBottom = '0px'
        cellRef.value.focus()
    })
}

const cellEditCompleted = (scope, data) => {

    const key = scope.column.property
    if (key == 'no') {
        const no = Number.parseInt(data)
        if (Number.isFinite(no)) {
            if (!character.value.filter(item => item !== scope.row).some(item => item.no === no)) {
                scope.row[key] = no
            }
            else {
                messages.add({
                text: '编号已存在',
                level: Message.TYPES.ERROR.LEVEL,
                to
            })
            }
        }
        else {
            messages.add({
                text: '格式错误',
                level: Message.TYPES.ERROR.LEVEL,
                to
            })
        }
    }
    else {
        scope.row[key] = data
    }
    const td = cellRef.value.ref.parentNode.parentNode.parentNode.parentNode
    td.style.paddingTop = '8px'
    td.style.paddingBottom = '8px'
    cell.value.row = void 0
    cell.value.column = void 0
}
const colorChange = (data, colorHexString) => {
    if (colorHexString) {
        const color = Color3.FromHexString(colorHexString)
        if (data.color.equals(color)) {
            return
        }
        data.color.r = color.r
        data.color.g = color.g
        data.color.b = color.b
    }
}
</script>

<template>
    <Dialog title="单元特性" :width="500">
        <el-form :model="operation" label-position="top" status-icon>
            <el-form-item>
                <el-select v-model="operation.type" placeholder="选择类型">
                    <el-option v-for="{ value, label } in options" :label="label" :value="value"
                        :key="value"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div style="display: flex;padding-bottom: 5px;">
            <el-button round @click="createCharacter" style="margin-left: auto;"><el-text type="info">
                    <IconFront iconName="node-plus"></IconFront> 添加
                </el-text></el-button>
            <el-button round @click="removeCharacter"><el-text type="info">
                    <IconFront iconName="node-minus"></IconFront> 删除
                </el-text> </el-button>
        </div>
        <el-table :data="character" @row-click="onRowClick" style="width: 100%;  margin-bottom: 20px"
            highlight-current-row max-height="400" border fit show-overflow-tooltip tooltip-effect="light"
            :header-cell-style="{ 'text-align': 'center' }" :cell-style="{ 'text-align': 'center' }">
            <el-table-column prop="no" label="编号" width="80">
                <template #default="scope">
                    <el-input v-if="cell.row === scope.$index && cell.column === scope.cellIndex" v-model="cell.data"
                        ref="cellRef" @keyup.enter="event => event.target.blur()"
                        @blur="cellEditCompleted(scope, cell.data)" />
                    <el-text v-else @dblclick="cellEdit(scope, cell)" truncated>{{ scope.row.no }}</el-text>
                </template>
            </el-table-column>
            <el-table-column prop="label" label="名称">
                <template #default="scope">
                    <el-input v-if="cell.row === scope.$index && cell.column === scope.cellIndex" v-model="cell.data"
                        ref="cellRef" @keyup.enter="event => event.target.blur()"
                        @blur="cellEditCompleted(scope, cell.data)" />
                    <el-text v-else @dblclick="cellEdit(scope, cell)" truncated>{{ scope.row.label.length
                        != 0 ? scope.row.label : '无' }}</el-text>
                </template>
            </el-table-column>
            <el-table-column prop="color" label="颜色">
                <template #default="scope">
                    <Color :color="scope.row.color.toHexString()" :width="0" :height="25"
                        @change="(color) => colorChange(scope.row, color)" style="padding: 0 10px;" />
                </template>
            </el-table-column>
            <template #empty>
                <Empty />
            </template>
        </el-table>
    </Dialog>
</template>

<style scoped></style>
