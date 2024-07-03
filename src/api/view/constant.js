import {Color3, Color4} from '@babylonjs/core'

const VIEWCONSTANT = {
    ROTATING: 0,
    SELECTING: {
        S: 1,
        A: 2,
        U: 3,
        NONE: 4
    },
    PREFIX: {
        MESH: {
            NODE: {
                PREP: 'n',
                RSLT: 'rn'
            },
            ELEM: {
                PREP: 'l',
                RSLT: 'rl'
            },
            MEMBRANE: {
                PREP: 'm',
                RSLT: 'rm'
            }
        },
        TEXT: 't'
    },
    LAYER: {
        MESH: {
            ALL: {
                ALL: 0x0000000f,
                PREP: 0x00000005,
                RSLT: 0x0000000a
            },
            NODE: {
                ALL: 0x00000003,
                PREP: 0x00000001,
                RSLT: 0x00000002
            },
            ELEM: {
                ALL: 0x0000000c,
                PREP: 0x00000004,
                RSLT: 0x00000008
            }
        },
        TEXTBLOCK: {
            LABEL: {
                ALL: {
                    ALL: 0x000000f0,
                    PREP: 0x00000050,
                    RSLT: 0x000000a0
                },
                NODE: {
                    ALL: 0x00000030,
                    PREP: 0x00000010,
                    RSLT: 0x00000020
                },
                ELEM: {
                    ALL: 0x000000c0,
                    PREP: 0x00000040,
                    RSLT: 0x00000080
                }
            },
            TARGET: {
                ALL: {
                    ALL: 0x0001ff00,
                    EQ: 0x00004900,
                    GT: 0x00009200,
                    LT: 0x00012400
                },
                NODESHAPE: {
                    ALL: 0x00000700,
                    EQ: 0x00000100,
                    GT: 0x00000200,
                    LT: 0x00000400
                },
                ELEMSHAPE: {
                    ALL: 0x00003800,
                    EQ: 0x00000800,
                    GT: 0x00001000,
                    LT: 0x00002000
                },
                ELEMFORCE: {
                    ALL: 0x0001c000,
                    EQ: 0x00004000,
                    GT: 0x00008000,
                    LT: 0x00010000
                }
            }
        },
        PICKBOX: 0x10000000
    },
    COLOR: {
        MESH: {
            NODE: {
                DEFAULT: Color3.Black(),
                SELECTED: Color3.Red(),
                PREP: {
                    FREE: Color3.Blue(),
                    LOCK: Color3.Gray()
                },
                RSLT: {
                    FREE: Color3.Black(),
                    LOCK: Color3.Gray()
                }
            },
            ELEM: {
                DEFAULT: Color3.Black(),
                SELECTED: Color3.Red(),
                BINDING: {
                    ETYPE: 'eType',
                    FEMTYPE: 'femType',
                    MAT: 'mat',
                    SEC: 'sec'
                },
                PREP: {
                    FREE: Color3.Black(),
                    LOCK: Color3.Gray()
                },
                RSLT: {
                    FREE: Color3.Black(),
                    LOCK: Color3.Gray()
                }
            },
            MEMBRANE: {
                DEFAULT: new Color4(0.5, 0.5, 0.5, 0.2)
            }
        },
        TEXTBLOCK: {
            //注意text颜色和mesh颜色格式是不一致的
            LABEL: {
                NODE: '#F56C6C',
                ELEM: '#67C23A'
            },
            TARGET:{
                NODESHAPE: '#909399',
                ELEMSHAPE: '#909399',
                ELEMFORCE: '#909399'
            }
        }
    }
}

export {VIEWCONSTANT}
