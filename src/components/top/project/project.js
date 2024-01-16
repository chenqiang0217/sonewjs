import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { CONSTANT } from '../../../stores/constant'
import { drawPointsInScene, drawLinesInScene, linkTextsWithMeshs } from '../../../stores/view'
import * as XLSX from 'xlsx/xlsx.mjs'
import { view } from '../../../stores/view'

import { sleep } from '../../../api/utils'


const projectNew = (e) => {

}
const projectOpen = (e) => {

}
const projectImportCilck = async (e) => {
    document.getElementById('xlsxFile').click()
}
const projectImport = async (e) => {
    const status = useStatusStore()
    status.view.loading = true
    await sleep(0.1)
    const files = e.target.files
    if (files.length != 0) {
        const file = files[0]
        readLocalFile(file, function (workbook) {
            readWorkbook(workbook)
            const model = useModelStore()
            view.scene.activeCamera.setView({direction: 'z', bounding: model.bounding})
        })
    }
    status.view.loading = false
}
const projectSave = (e) => {

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
    const model = useModelStore()
    const status = useStatusStore()
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

export { projectNew, projectOpen, projectImportCilck, projectImport, projectSave }