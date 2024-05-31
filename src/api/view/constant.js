import { Color3, Color4 } from "@babylonjs/core"

const VIEWCONSTANT = {
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
            MEMBRANE: {
                PREP: 'm',
                RSLT: 'rm',
            },
        },
        TEXT: 't',
    },
    LAYER: {
        MESH: {
            ALL: {
                ALL: 0x0000000F,
                PREP: 0x00000005,
                RSLT: 0x0000000A,
            },
            NODE: {
                ALL: 0x00000003,
                PREP: 0x00000001,
                RSLT: 0x00000002,
            },
            ELEM: {
                ALL: 0x0000000C,
                PREP: 0x00000004,
                RSLT: 0x00000008,
            },
        },
        TEXT: {
            ALL: {
                ALL: 0x000000F0,
                PREP: 0x00000050,
                RSLT: 0x000000A0,
            },
            NODE: {
                ALL: 0x00000030,
                PREP: 0x00000010,
                RSLT: 0x00000020,
            },
            ELEM: {
                ALL: 0x000000C0,
                PREP: 0x00000040,
                RSLT: 0x00000080,
            },
        },
        PICKBOX: 0x00010000,
    },
    COLOR: {
        MESH: {
            NODE: {
                DEFAULT: Color3.Black(),
                SELECTED: Color3.Red(),
                PREP: {
                    FREE: Color3.Blue(),
                    LOCK: Color3.Gray(),
                },
                RSLT: {
                    FREE: Color3.Black(),
                    LOCK: Color3.Gray(),
                },
            },
            ELEM: {
                DEFAULT: Color3.Black(),
                SELECTED: Color3.Red(),
                BINDING: {
                    TYPE: 'type',
                    FEMTYPE: 'femType',
                    MAT: 'mat',
                    SEC: 'sec',
                },
                PREP: {
                    FREE: Color3.Black(),
                    LOCK: Color3.Gray(),
                },
                RSLT: {
                    FREE: Color3.Black(),
                    LOCK: Color3.Gray(),
                },
            },
            MEMBRANE: {
                DEFAULT: new Color4(0.5, 0.5, 0.5, 0.2),
            }
        },
        TEXT: {
            //注意text颜色和mesh颜色格式是不一致的
            NODE: 'red',
            ELEM: 'green',
        },
    },
}

export { VIEWCONSTANT }