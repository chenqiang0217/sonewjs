const CONSTANT = {
    MODE: {
        PREP: 0b00000000,
        RSLT: 0b00000001
    },
    TASK: {
        RUN: {
            NONE: 0b00000000,
            START: 0b00000001,
            SUCCESS: 0b00000010,
            ABORT: -1,
        },
    },
}

export { CONSTANT }