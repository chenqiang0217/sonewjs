import {Color3} from '@babylonjs/core'
import {defineStore} from 'pinia'
import {VIEWCONSTANT} from './constant'

const devicePixelRatio = window.devicePixelRatio
const useViewConfigStore = defineStore('viewConfig', {
    state: () => {
        return {
            canvas: 'canvas',
            mesh: {
                node: {
                    widthPx: 3 * devicePixelRatio,
                    color: {
                        selected: VIEWCONSTANT.COLOR.MESH.NODE.SELECTED,
                        lock: VIEWCONSTANT.COLOR.MESH.NODE.LOCK,
                        free: VIEWCONSTANT.COLOR.MESH.NODE.FREE
                    }
                },
                elem: {
                    widthPx: 1 * devicePixelRatio,
                    color: {
                        selected: VIEWCONSTANT.COLOR.MESH.ELEM.SELECTED,
                        binding: VIEWCONSTANT.COLOR.MESH.ELEM.BINDING.ETYPE,
                        contour: {
                            by: 'f',
                            nSec: 11,
                            lower: Color3.Blue(),
                            higher: Color3.Red()
                        }
                    }
                },
                membrane: {
                    color: {
                        selected: VIEWCONSTANT.COLOR.MESH.MEMBRANE.DEFAULT,
                        lock: VIEWCONSTANT.COLOR.MESH.MEMBRANE.DEFAULT,
                        free: VIEWCONSTANT.COLOR.MESH.MEMBRANE.DEFAULT
                    }
                }
            },
            textBlock: {
                node: {
                    label:{
                        family: 'JetBrains Mono Regular',
                        size: 14,
                        color: VIEWCONSTANT.COLOR.TEXTBLOCK.NODE.LABEL
                    },
                    target:{
                        nodeShape: {
                            family: 'JetBrains Mono Regular',
                            size: 14,
                            color: VIEWCONSTANT.COLOR.TEXTBLOCK.NODE.TARGET.NODESHAPE
                        }
                    }
                },
                elem: {
                    label:{
                        binding: VIEWCONSTANT.COLOR.MESH.ELEM.BINDING.NO,
                        family: 'JetBrains Mono Regular',
                        size: 14,
                        color: VIEWCONSTANT.COLOR.TEXTBLOCK.ELEM.LABEL
                    },
                    target:{
                        elemShape: {
                            family: 'JetBrains Mono Regular',
                            size: 14,
                            color: VIEWCONSTANT.COLOR.TEXTBLOCK.ELEM.TARGET.ELEMSHAPE
                        },
                        elemForce: {
                            family: 'JetBrains Mono Regular',
                            size: 14,
                            color: VIEWCONSTANT.COLOR.TEXTBLOCK.ELEM.TARGET.ELEMSHAPE
                        }
                    }
                }
            }
        }
    },
    getters: {
        contour: state => {
            const {nSec, lower, higher} = state.mesh.elem.color.contour
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
