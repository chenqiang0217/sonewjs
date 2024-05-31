import * as XLSX from 'xlsx/xlsx.mjs'
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useView } from '../../../api/view/index'
import { sleep } from '../../../api/utils'


const projectNew = (e) => {
}
const projectOpen = (e) => {

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
            const view = useView()
            view.scene.activeCamera.setView({direction: 'z', bounding: view.bounding})
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
    reader.readAsArrayBuffer(file)
}

function readWorkbook(workbook) {
    const view = useView()
    const model = useModelStore()
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
                callFunc(func, lines.map(item => Number(item)))
            } else { break }
        }
    }
    model.node.forEach(node => view.createPoint(node))
    model.elem.forEach(elem => view.createLine(elem))
}

function callFunc(func, data) {
    func(data)
}

export { projectNew, projectOpen, projectImport, projectSave }