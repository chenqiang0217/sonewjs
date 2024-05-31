import { defineStore } from 'pinia'
import { VIEWCONSTANT } from './constant'

const useViewStatusStore = defineStore('viewStatus', {
    state: () => {
        return {
            size: {
                width: 0,
                height: 0
            },
            mode: VIEWCONSTANT.ROTATING,
            pointer: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
            mesh: {
                visible: {
                    node: true,
                    elem: true,
                    cnst: false,
                    nodeShape: false,
                },
                selected: {
                    info: {},
                    region: [{}, {}],
                    node: new Set([]),
                    elem: new Set([]),
                },
                activated: {
                    node: { prep: new Set([]), rslt: new Set([]) },
                    elem: { prep: new Set([]), rslt: new Set([]) },
                },
                // todo: {
                //     activate: {
                //         node: { prep: new Set([]), rslt: new Set([]) },
                //         elem: { prep: new Set([]), rslt: new Set([]) },
                //     },
                //     freeze: {
                //         node: { prep: new Set([]), rslt: new Set([]) },
                //         elem: { prep: new Set([]), rslt: new Set([]) },
                //     },
                //     draw: {
                //         node: { prep: new Set([]), rslt: new Set([]) },//模型节点|结果节点
                //         elem: { prep: new Set([]), rslt: new Set([]) },//模型单元|结果单元
                //     },
                //     clear: {
                //         node: { prep: new Set([]), rslt: new Set([]) },//模型节点|结果节点
                //         elem: { prep: new Set([]), rslt: new Set([]) },//模型单元|结果单元
                //     },
                // },
            },
            text: {
                prefix: 't',
                visible: {
                    node: false,
                    elem: false,
                    cnst: false,
                    nodeShape: false,
                },
                // binding: {
                //     node: 'no',
                //     elem: 'no',
                //     cnst: 'no',
                //     nodeShape: 'no',
                // },
                // activated: {
                //     node: { prep: new Set([]), rslt: new Set([]) },
                //     elem: { prep: new Set([]), rslt: new Set([]) },
                // },
            },
        }
    },
    getters: {
        
    },
    actions: {
        
    }
})

export { useViewStatusStore }