import {defineStore} from 'pinia'

const useConfigStore = defineStore('config', {
    state: () => {
        return {
            project: {
                name: ``,
                date: ``,
                description: ''
            },
            ui: {
                theme: '',
                font: ``,
                sizePx: 12
            },
            task: {
                response: {
                    delaySecond: 5,
                    // 服务端连续retry次都无法返回结果，即断开连接
                    retry: 10,
                    count: 50
                }
            }
        }
    },
    actions: {}
})

export {useConfigStore}
