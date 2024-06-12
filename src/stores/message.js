import {defineStore} from 'pinia'
export class Message {
    static TYPES = {
        INFO: {LEVEL: 1, NAME: 'info'},
        SUCCESS: {LEVEL: 2, NAME: 'success'},
        WARNING: {LEVEL: 3, NAME: 'warning'},
        ERROR: {LEVEL: 4, NAME: 'danger'},
        COMMANDER: {LEVEL: 5, NAME: 'commander'}
    }
    constructor({text, level, delay=0}) {
        this.text = text
        this.level = level
        this.delay = delay
        // const now = new Date()
        // this.time =
        //     ('0' + now.getHours()).slice(-2) +
        //     ':' +
        //     ('0' + now.getMinutes()).slice(-2) +
        //     ':' +
        //     ('0' + now.getSeconds()).slice(-2)
    }
}
export const useMessageStore = defineStore('message', {
    state: () => {
        return {
            client: [
                // new Message({
                //     text: "let s = 'hello world'\nreturn 'hello world'",
                //     level: Message.TYPES.COMMANDER.LEVEL
                // }),
                // new Message({
                //     text: "return 'hello world'",
                //     level: Message.TYPES.COMMANDER.LEVEL
                // }),
                // new Message({
                //     text: "const b = 'hello world'",
                //     level: Message.TYPES.INFO.LEVEL
                // })
            ],
            server: []
        }
    },
    actions: {
        add({text, level = Message.TYPES.INFO.LEVEL, to = 'client', delay = 0}) {
            this[to].push(new Message({text, level, delay}))
            return {
                to,
                index: this[to].length - 1
            }
        },
        clear(to = 'client') {
            this.message[to] = []
        }
    }
})
