import { Color3 } from "@babylonjs/core"
const CONSTANT = {
    MODE:{
        PREP: 0,
        RSLT: 1,
    },
    VIEW: {
        ROTATING: 0,
        SELECTING: {
            S: 1,
            A: 2,
            U: 3,
            NONE: 4,
        },
        PREFIX: {
            MESH: {
                NODE: {
                    PREP: 'n',
                    RSLT: 'rn',
                },
                ELEM: {
                    PREP: 'l',
                    RSLT: 'rl',
                },
            },
            TEXT: 't',
        },
        COLOR: {
            MESH: {
                NODE: {
                    DEFAULT: Color3.Black(),
                    SELECTED: Color3.Red(),
                    UNSELECTED: Color3.Blue(),
                    CALCULATED: {
                        DEFORMED: Color3.Black(),
                        UNDEFORMED: Color3.Gray(),
                    },
                },
                ELEM: {
                    DEFAULT: Color3.Black(),
                    SELECTED: Color3.Red(),
                    UNSELECTEDBINDING: {
                        TYPE: 'type',
                        FEMTYPE: 'femType',
                        MAT: 'mat',
                        SEC: 'sec',
                    },
                    CALCULATED: {
                        DEFORMED: Color3.Black(),
                        UNDEFORMED: Color3.Gray(),
                    }
                },
            },
            TEXT: {
                //注意text颜色和mesh颜色格式是不一致的
                NODE: 'red',
                ELEM: 'green',
            },
        },
    },
    TASK: {
        RUN: {
            NONE: 0,
            START: 1,
            SUCCESS: 2,
            ABORT: -1,
        },
    },
}

export { CONSTANT }