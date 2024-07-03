import {Color3} from '@babylonjs/core'
import {defineStore} from 'pinia'
import {VIEWCONSTANT} from './constant'
import {Elem} from '../model/elem'
import {TextBlock} from '@babylonjs/gui'
import {NodeShape} from '../model'

const useViewConfigStore = defineStore('viewConfig', {
    state: () => {
        return {
            canvas: 'canvas',
            mesh: {
                node: {
                    sizePx: 3,
                    color: {
                        selected: VIEWCONSTANT.COLOR.MESH.NODE.SELECTED,
                        prep: {
                            lock: VIEWCONSTANT.COLOR.MESH.NODE.PREP.LOCK,
                            free: VIEWCONSTANT.COLOR.MESH.NODE.PREP.FREE
                        },
                        rslt: {
                            lock: VIEWCONSTANT.COLOR.MESH.NODE.RSLT.LOCK,
                            free: VIEWCONSTANT.COLOR.MESH.NODE.RSLT.FREE
                        }
                    }
                },
                elem: {
                    color: {
                        selected: VIEWCONSTANT.COLOR.MESH.ELEM.SELECTED,
                        prep: {
                            binding: VIEWCONSTANT.COLOR.MESH.ELEM.BINDING.ETYPE,
                            eType: new Map([
                                [
                                    Elem.ETYPE.LOCK,
                                    VIEWCONSTANT.COLOR.MESH.ELEM.PREP.LOCK
                                ],
                                [
                                    Elem.ETYPE.FREE,
                                    VIEWCONSTANT.COLOR.MESH.ELEM.PREP.FREE
                                ]
                            ]),
                            femType: new Map(),
                            mat: new Map(),
                            sec: new Map()
                        },
                        rslt: {
                            binding: VIEWCONSTANT.COLOR.MESH.ELEM.BINDING.ETYPE,
                            eType: new Map([
                                [
                                    Elem.ETYPE.LOCK,
                                    VIEWCONSTANT.COLOR.MESH.ELEM.RSLT.LOCK
                                ],
                                [
                                    Elem.ETYPE.FREE,
                                    VIEWCONSTANT.COLOR.MESH.ELEM.RSLT.FREE
                                ]
                            ]),
                            contour: {
                                by: 'f',
                                nSec: 11,
                                lower: Color3.Blue(),
                                higher: Color3.Red()
                            }
                        }
                    }
                },
                membrane: {
                    color: {
                        selected: VIEWCONSTANT.COLOR.MESH.MEMBRANE.DEFAULT,
                        prep: {
                            lock: VIEWCONSTANT.COLOR.MESH.MEMBRANE.DEFAULT,
                            free: VIEWCONSTANT.COLOR.MESH.MEMBRANE.DEFAULT
                        },
                        rslt: {
                            lock: VIEWCONSTANT.COLOR.MESH.MEMBRANE.DEFAULT,
                            free: VIEWCONSTANT.COLOR.MESH.MEMBRANE.DEFAULT
                        }
                    }
                }
            },
            textBlock: {
                fontFamily: 'JetBrains Mono',
                sizePx: '14',
                label: {
                    node: {
                        color: VIEWCONSTANT.COLOR.TEXTBLOCK.LABEL.NODE
                    },
                    elem: {
                        color: VIEWCONSTANT.COLOR.TEXTBLOCK.LABEL.ELEM
                    }
                },
                target: {
                    nodeShape: {
                        color: VIEWCONSTANT.COLOR.TEXTBLOCK.TARGET.NODESHAPE
                    },
                    elemShape: {
                        color: VIEWCONSTANT.COLOR.TEXTBLOCK.TARGET.ELEMSHAPE
                    },
                    elemForce: {
                        color: VIEWCONSTANT.COLOR.TEXTBLOCK.TARGET.ELEMFORCE
                    }
                }
            }
        }
    },
    getters: {
        contour: state => {
            const {nSec, lower, higher} = state.mesh.elem.color.rslt.contour
            let dColor = higher.subtract(lower)
            const colors = []
            for (let i = 0; i < nSec; i++) {
                colors.push(lower.add(dColor.scale(i / (nSec - 1))))
            }
            return colors
        }
    },
    actions: {}
})

export {useViewConfigStore}
