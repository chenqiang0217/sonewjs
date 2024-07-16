import {defineStore} from 'pinia'
export class Message {
    static TYPES = {
        INFO: {LEVEL: 1, NAME: 'info'},
        SUCCESS: {LEVEL: 2, NAME: 'success'},
        WARNING: {LEVEL: 3, NAME: 'warning'},
        ERROR: {LEVEL: 4, NAME: 'danger'},
        COMMANDER: {LEVEL: 5, NAME: 'commander'}
    }
    constructor({text, level, animation = false}) {
        this.text = text
        this.level = level
        this.animation = animation
    }
}
export const useMessageStore = defineStore('message', {
    state: () => {
        return {
            client: [],
            server: []
        }
    },
    actions: {
        add({
            text,
            level = Message.TYPES.INFO.LEVEL,
            to = 'client',
            animation = false
        }) {
            this[to].push(new Message({text, level, animation}))
            return {
                to,
                index: this[to].length - 1
            }
        },
        clear(to = 'client') {
            this[to] = []
        }
    }
})
