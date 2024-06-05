class Message {
    static LEVEL = {
        INFO: 0,
        SUCCESS: 1,
        WARNING: 2,
        ERROR: 3
    }
    constructor({text, level = Message.LEVEL.INFO}) {
        this.text = text
        this.level = level
        const now = new Date()
        this.time =
            ('0' + now.getHours()).slice(-2) +
            ':' +
            ('0' + now.getMinutes()).slice(-2) +
            ':' +
            ('0' + now.getSeconds()).slice(-2)
    }
}

export {Message}
