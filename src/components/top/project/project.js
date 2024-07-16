import * as XLSX from 'xlsx/xlsx.mjs'
import {useModelStore} from '../../../stores/model'
import {useStatusStore} from '../../../stores/status'
import {useView} from '../../../api/view/index'
import {sleep} from '../../../api/utils'

const projectNew = e => {}
const projectOpen = e => {}
const projectImport = async e => {
    const status = useStatusStore()
    status.view.loading = true
    await sleep(0.1)
    const files = e.target.files
    if (files.length != 0) {
        const file = files[0]
        readLocalFile(file, function (workbook) {
            readWorkbook(workbook)
            const view = useView()
            view.scene.activeCamera.setView({
                direction: 'z',
                bounding: view.bounding
            })
        })
    }
    status.view.loading = false
}
const projectSave = e => {}
const readLocalFile = (file, callback) => {
    const reader = new FileReader()
    reader.onload = function (e) {
        if (callback) callback(XLSX.read(e.target.result, {type: 'binary'}))
    }
    reader.readAsArrayBuffer(file)
}

function readWorkbook(workbook) {
    const model = useModelStore()
    const labels = [
        'node',
        'elem',
        'constraint',
        'nodeShape',
        'elemShape',
        'elemForce'
    ]
    const funcs = [
        model.createNode,
        model.createElem,
        model.createCnst,
        model.createNodeShape,
        model.createElemShape,
        model.createElemForce
    ]
    for (const label of labels) {
        const func = funcs.shift()
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[label], {
            header: 1
        })
        sheet.shift()
        if (label == 'elem') {
            const view = useView()
            const color = view.scene.metadata.constant.COLOR.MESH.ELEM.DEFAULT
            let index
            index = 2
            sheet
                .map(line => Number.parseInt(Number(line[index])))
                .filter((item, i, arr) => arr.indexOf(item) === i)
                .forEach(no => {
                    if (!model.elemFemType.some(item => item.no == no)) {
                        model.createElemFemType(no, String(no), color.clone())
                    }
                })
            index = 3
            sheet
                .map(line => Number.parseInt(Number(line[index])))
                .filter((item, i, arr) => arr.indexOf(item) === i)
                .forEach(no => {
                    if (!model.elemMat.some(item => item.no == no)) {
                        model.createElemMat(no, String(no), color.clone())
                    }
                })
            index = 4
            sheet
                .map(line => Number.parseInt(Number(line[index])))
                .filter((item, i, arr) => arr.indexOf(item) === i)
                .forEach(no => {
                    if (!model.elemSec.some(item => item.no == no)) {
                        model.createElemSec(no, String(no), color.clone())
                    }
                })
        }
        if (['nodeShape', 'elemShape', 'elemForce'].includes(label)) {
            const index = 1
            sheet
                .map(line => Number.parseInt(Number(line[index])))
                .filter((item, i, arr) => arr.indexOf(item) === i)
                .forEach(no => {
                    if (!model.target.group.some(item => item.no == no)) {
                        model.createTargetGroup(no, String(no), String(no))
                    }
                })
        }
        for (let lines of sheet) {
            if (lines.length) {
                callFunc(
                    func,
                    lines.map(item => Number(item))
                )
            } else {
                break
            }
        }
    }
}

function callFunc(func, data) {
    func(data)
}

export {projectNew, projectOpen, projectImport, projectSave}
