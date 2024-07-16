import { defineStore } from 'pinia'
import { CONSTANT } from './constant'

const useStatusStore = defineStore('status', {
    state: () => {
        return {
            mode: 0,
            ui: {
                dialog:{
                    show: false,
                    apply: false,
                    component: void 0,
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
                loading: false
            },
            task: {
                run: CONSTANT.TASK.RUN.NONE,
                response: {
                    step: 0,
                    loadStep: 0,
                    subStep: 0,
                    iterativeStep: 0,
                },
                view:{
                    step: 0
                }
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
        resetTaskResponse() {
            this.task.response.step = 0
            this.task.response.loadStep = 0
            this.task.response.subStep = 0
            this.task.response.iterativeStep = 0
        }
    }
})

export { useStatusStore }