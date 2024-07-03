import {defineStore} from 'pinia'
import {VIEWCONSTANT} from './constant'

const useViewStatusStore = defineStore('viewStatus', {
    state: () => {
        return {
            size: {
                width: 0,
                height: 0
            },
            mode: VIEWCONSTANT.ROTATING,
            pointer: [
                {x: 0, y: 0},
                {x: 0, y: 0}
            ],
            mesh: {
                visible: {
                    node: true,
                    elem: true,
                    cnst: false,
                    nodeShape: false
                },
                selected: {
                    info: {},
                    region: [{}, {}],
                    node: new Set([]),
                    elem: new Set([])
                },
                activated: {
                    node: {prep: new Set([]), rslt: new Set([])},
                    elem: {prep: new Set([]), rslt: new Set([])}
                }
            },
            textBlock: {
                prefix: 't',
                visible: {
                    label: {
                        node: false,
                        elem: false
                    },
                    cnst: false,
                    target: {
                        all:false,
                        nodeShape: {
                            all: false,
                            eq: false,
                            gt: false,
                            lt: false
                        },
                        elemShape: {
                            all: false,
                            eq: false,
                            gt: false,
                            lt: false
                        },
                        elemForce: {
                            all: false,
                            eq: false,
                            gt: false,
                            lt: false
                        }
                    }
                }
            }
        }
    },
    getters: {},
    actions: {}
})

export {useViewStatusStore}
