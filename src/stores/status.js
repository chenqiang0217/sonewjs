import { markRaw } from 'vue'
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
                loading: false
            },
            task: {
                uuid: '2ff4fda4-c8f8-4e7e-b11d-bf8da910d5c8',
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