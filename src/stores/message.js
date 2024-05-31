import { defineStore } from 'pinia'

export const useMessageStore = defineStore('message', {
    state: () => {
        return {
            maxClientId: 0,
            maxServerId: 0,
            client: [
                // {content: '欢迎使用', level:'info'},
                // {content: '输入正确', level:'success'},
                // {content: '输入错误', level:'warning'},
                // {content: '致命错误', level:'error'},
                // {content: '输入正确', level:'success'},
                // {content: '输入错误', level:'warning'},
                // {content: '致命错误', level:'error'},
            ],
            server: []
        }
    },
    actions: {
        add({ to, level, content }) {
            let id
            const message = this[to]
            const now = new Date()
            const time =
                ('0' + now.getHours()).slice(-2) +
                ':' +
                ('0' + now.getMinutes()).slice(-2) +
                ':' +
                ('0' + now.getSeconds()).slice(-2)

            if (to === 'client') {
                this.maxClientId += 1
                id = this.maxClientId
            } else if (to === 'server') {
                this.maxServerId += 1
                id = this.maxServerId
            }
            message.push({ id, time, level, content })
            return id
        },
        update(id, { to, level, content }) {
            const now = Date.now()
            const time =
                ('0' + now.getHours()).slice(-2) +
                ':' +
                ('0' + now.getMinutes()).slice(-2) +
                ':' +
                ('0' + now.getSeconds()).slice(-2)
            const message = this[to]
            const index = message.findIndex(item => {
                item.id === id
            })
            if (index > 0) {
                message[index] = { id, time, level, content }
            }
        },
        clear(to) {
            if (to === 'client') {
                this.maxClientId = 0
                this.message[to] = []
            } else if (to === 'server') {
                this.maxServerId = 0
                this.message[to] = []
            }
        }
    }
})
