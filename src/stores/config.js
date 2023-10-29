import { Color3 } from "@babylonjs/core"
import { defineStore } from 'pinia'
import { CONSTANT } from './constant'
import { useModelStore } from './model'

const DEFAULT = {
    //用于为单元类型，材料，截面提供默认颜色
    COLOR: {
        NODE: `blue`,
        ELEM: `black`,
        text: `black`,
    }
}

const useConfigStore = defineStore('config', {
    state: () => {
        return {
            project: {
                name: ``,
                date: ``,
                description: '',
            },
            ui: {
                theme: '',
                font: ``,
                sizePx: 12,
            },
            view: {
                node: {
                    sizePx: 0.5,
                    color: {
                        selected: CONSTANT.VIEW.COLOR.MESH.NODE.SELECTED,
                        unselected: {
                            lock: CONSTANT.VIEW.COLOR.MESH.NODE.UNSELECTED,
                            free: CONSTANT.VIEW.COLOR.MESH.NODE.UNSELECTED,
                        },
                        calculated: {
                            deformed: CONSTANT.VIEW.COLOR.MESH.NODE.CALCULATED.DEFORMED,
                            undeformed: CONSTANT.VIEW.COLOR.MESH.NODE.CALCULATED.UNDEFORMED,
                        },
                    },
                },
                elem: {
                    color: {
                        selected: CONSTANT.VIEW.COLOR.MESH.ELEM.SELECTED,
                        unselected: {
                            binding: CONSTANT.VIEW.COLOR.MESH.ELEM.UNSELECTEDBINDING.TYPE,
                            type: {
                                lock: CONSTANT.VIEW.COLOR.MESH.ELEM.DEFAULT,
                                free: CONSTANT.VIEW.COLOR.MESH.ELEM.DEFAULT,
                            },
                            femType: {
                            },
                            mat: {
                            },
                            sec: {
                            },
                        },
                        calculated: {
                            deformed: CONSTANT.VIEW.COLOR.MESH.ELEM.CALCULATED.DEFORMED,
                            undeformed: CONSTANT.VIEW.COLOR.MESH.ELEM.CALCULATED.UNDEFORMED,
                            gadient: {
                                by: 'f',
                                nSec: 11,
                                lower: Color3.Blue(),
                                higher: Color3.Red(),
                            }
                        },
                    },
                },
                text: {
                    node: {
                        font: '',
                        sizePx: '18',
                        color: CONSTANT.VIEW.COLOR.TEXT.NODE,
                    },
                    elem: {
                        font: '',
                        sizePx: '18',
                        color: CONSTANT.VIEW.COLOR.TEXT.ELEM,
                    },
                },
            },
            task: {
                uuid: '2ff4fda4-c8f8-4e7e-b11d-bf8da910d5c8',
                loadStep: [
                    {
                        no: 1,
                        name: 'basis',
                        categorization: 'basis',
                        nSubStep: 7,
                        description: 'basis',
                        subStep: [
                            {
                                no: 1,
                                nIterativeStep: 10,
                                alpha: 1.0e2,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 2,
                                nIterativeStep: 20,
                                alpha: 1.0e1,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 3,
                                nIterativeStep: 20,
                                alpha: 1.0e0,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 4,
                                nIterativeStep: 20,
                                alpha: 1.0e-1,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 5,
                                nIterativeStep: 50,
                                alpha: 1.0e-3,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 6,
                                nIterativeStep: 50,
                                alpha: 1.0e-5,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 7,
                                nIterativeStep: 50,
                                alpha: 0,
                                rsdl: 1.0e-6,
                            },
                        ],
                    },
                ],
                result: {
                    query: {
                        count: 500,
                        delaySecond: 5,
                        timeoutSecond: 5,
                        retry: 100000,
                    }
                }
            }
        }
    },
    getters: {
        elemGadientColors: (state) => {
            let nSec = state.view.elem.color.calculated.gadient.nSec
            let lowerColor = state.view.elem.color.calculated.gadient.lower
            let higherColor = state.view.elem.color.calculated.gadient.higher
            let dColor = higherColor.subtract(lowerColor)
            const colors = []
            for (let i = 0; i < nSec; i++) {
                colors.push(lowerColor.add(dColor.scale(i / (nSec - 1))))
            }
            return colors
        }
    },
    actions: {
        initialization() {
            const model = useModelStore()
            watch(
                () => {
                    return {
                        femType: model.summarized.elem.femType.map(femType => femType.no),
                        mat: model.summarized.elem.mat.map(mat => mat.no),
                        sec: model.summarized.elem.mat.map(sec => sec.no),
                    }
                },
                (now, pre) => {
                    [CONSTANT.VIEW.COLOR.MESH.ELEM.UNSELECTEDBINDING.FEMTYPE, CONSTANT.VIEW.COLOR.MESH.ELEM.UNSELECTEDBINDING.MAT, CONSTANT.VIEW.COLOR.MESH.ELEM.UNSELECTEDBINDING.SEC]
                        .map(key => {
                            now[key].map(no => {
                                if (!pre[key].includes(no)) {
                                    //no为数字，只能通过[]访问
                                    this.view.elem.color.unselected[key][no] = CONSTANT.VIEW.COLOR.MESH.ELEM.DEFAULT
                                }
                            })
                        })
                }
            )
        }
    },
})



export { useConfigStore }