import { markRaw } from 'vue'
import { defineStore } from 'pinia'
import { CONSTANT } from './constant'
import { useConfigStore } from './config'

const useStatusStore = defineStore('status', {
    state: () => {
        return {
            mode: 0,
            ui: {
                dialog:{
                    show: false,
                    apply: false,
                    title: '', 
                    width: 0,
                    component: markRaw({is: null}),
                },
                tab: {
                    main: {
                        list: [`view`],
                        active: `view`,
                    },
                    message: {
                        list: [`client`, `server`],
                        active: `client`,
                    },
                },
            },
            view: {
                loading: false,
                size: {
                    width: 0,
                    height: 0
                },
                mode: CONSTANT.VIEW.ROTATING,
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
                    todo: {
                        activate: {
                            node: { prep: new Set([]), rslt: new Set([]) },
                            elem: { prep: new Set([]), rslt: new Set([]) },
                        },
                        freeze: {
                            node: { prep: new Set([]), rslt: new Set([]) },
                            elem: { prep: new Set([]), rslt: new Set([]) },
                        },
                        draw: {
                            node: { prep: new Set([]), rslt: new Set([]) },//模型节点|结果节点
                            elem: { prep: new Set([]), rslt: new Set([]) },//模型单元|结果单元
                        },
                        clear: {
                            node: { prep: new Set([]), rslt: new Set([]) },//模型节点|结果节点
                            elem: { prep: new Set([]), rslt: new Set([]) },//模型单元|结果单元
                        },
                    },
                },
                text: {
                    prefix: 't',
                    visible: {
                        node: false,
                        elem: false,
                        cnst: false,
                        nodeShape: false,
                    },
                    binding: {
                        node: 'no',
                        elem: 'no',
                        cnst: 'no',
                        nodeShape: 'no',
                    },
                    activated: {
                        node: { prep: new Set([]), rslt: new Set([]) },
                        elem: { prep: new Set([]), rslt: new Set([]) },
                    },
                },
            },
            task: {
                run: CONSTANT.TASK.RUN.NONE,
                query: {
                    step: 0,
                    loadStep: 0,
                    subStep: 0,
                    iterativeStep: 0,
                    retry: 0,
                },
            },
            result: {
                option: {
                    step: 0,
                },
            },
            user: {
                name: ``,
                password: ``,
                mobilePhone: ``,
                email: ``,
                regiserDate: [],
                group: [],
                role: [],
            }
        }
    },
    getters: {
        taskQueryProgress: (state) => {
            const config = useConfigStore()
            let totalStep = 0
            config.task.loadStep.forEach((loadStep) => {
                loadStep.subStep.forEach(subStep => totalStep += subStep.nIterativeStep)
            })
            switch (state.task.run) {
                case CONSTANT.TASK.RUN.NONE:
                    return 0
                case CONSTANT.TASK.RUN.ABORT:
                    return 0
                case CONSTANT.TASK.RUN.START:
                    return totalStep ? (state.task.query.step / totalStep) : 0
                case CONSTANT.TASK.RUN.SUCCESS:
                    return 1
            }
        },
    },
    actions: {
        addMainTab(tableName) {
            let index = this.ui.tab.main.list.findIndex(name => name === tableName)
            if (index != -1) {
                this.ui.tab.main.list.splice(index, 1)
            }
            this.ui.tab.main.list.push(tableName)
            this.ui.tab.main.active = tableName
        },
    }
})

export { useStatusStore }