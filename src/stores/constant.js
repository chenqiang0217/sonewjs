const CONSTANT = {
    TASK: {
        RUN: {
            NONE: 0b00000000,
            PROGRESS: 0b00000001,
            SUCCESS: 0b00000010,
            FAIL: 0b00000011,
            ABORT: 0b00000100,
            END: 0b00000101
        },
    },
}

export { CONSTANT }