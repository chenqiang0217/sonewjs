<script setup>
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { CONSTANT } from '../../../stores/constant'
import { drawPointsInScene, drawLinesInScene, linkTextsWithMeshs } from '../../../stores/view'
import * as XLSX from 'xlsx/xlsx.mjs'
import { sleep } from '../../../api/utils'


const model = useModelStore()
const status = useStatusStore()
const createNewProject = (e) => {

}
const importXlsx = async (e) => {
    status.ui.project.importing = true
    await sleep(0.1)
    const files = e.target.files
    if (files.length != 0) {
        const file = files[0]
        readLocalFile(file, function (workbook) {
            readWorkbook(workbook)
        })
    }
    status.ui.project.importing = false
}
const readLocalFile = (file, callback) => {
    const reader = new FileReader()
    reader.onload = function (e) {
        if (callback) callback(
            XLSX.read(e.target.result, { type: 'binary' })
        )
    }
    reader.readAsBinaryString(file)
}

function readWorkbook(workbook) {
    const labels = ['node', 'elem', 'constraint', 'nodeShape', 'elemShape', 'elemForce']
    const funcs = [model.insertNode, model.insertElem, model.insertCnst,
    model.insertNodeShape, model.insertElemShape, model.insertElemForce]
    for (let label of labels) {
        let func = funcs.shift()
        let sheet = XLSX.utils.sheet_to_json(
            workbook.Sheets[label], { header: 1 }
        )
        sheet.shift()
        for (let lines of sheet) {
            if (lines.length) {
                callFunc(func, Number(lines.shift()), lines.map(item => Number(item)))
            } else { break }
        }
    }
    //为避免通过放入todo，lines先于points执行导致错误，直接执行mesh。
    drawPointsInScene(model.categorized.node.all)
    drawLinesInScene(model.categorized.elem.all)
    status.view.mesh.activated.node.prep = new Set(model.categorized.node.all)
    status.view.mesh.activated.elem.prep = new Set(model.categorized.elem.all)
    linkTextsWithMeshs(
        Array.from(model.categorized.node.all).map(no => ({ no })),
        CONSTANT.VIEW.PREFIX.MESH.NODE.PREP
    )
    linkTextsWithMeshs(
        Array.from(model.categorized.elem.all).map(no => ({ no })),
        CONSTANT.VIEW.PREFIX.MESH.ELEM.PREP
    )
    status.view.text.activated.node.prep = new Set(model.categorized.node.all)
    status.view.text.activated.elem.prep = new Set(model.categorized.elem.all)
}

function callFunc(func, no, data) {
    func(no, data)
}

</script>

<template>
    <el-button-group>
        <el-tooltip content="新建" placement="bottom">
            <el-button @click="createNewProject">
                <IconFront iconName="new"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="打开" placement="bottom">
            <el-button>
                <IconFront iconName="open"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="导入" placement="bottom">
            <el-button onclick="document.getElementById('xlsxFile').click()">
                <IconFront iconName="import"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="保存" placement="bottom">
            <el-button>
                <IconFront iconName="save"></IconFront>
            </el-button>
        </el-tooltip>
    </el-button-group>
    <input
        type="file"
        id="xlsxFile"
        @change="importXlsx"
        style="display: none"
    />
</template>

<style></style>