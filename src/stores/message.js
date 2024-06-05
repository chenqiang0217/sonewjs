import {defineStore} from 'pinia'
import {Message} from '../api/message'

export const useMessageStore = defineStore('message', {
    state: () => {
        return {
            client: [
                // {content: 'welcome to sonew, build at 2024.0531', level:'info'},
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
        add({text, level = Message.LEVEL.INFO, to = 'client'}) {
            this[to].push(new Message({text, level}))
        },
        clear(to = 'client') {
            this.message[to] = []
        }
    }
})
