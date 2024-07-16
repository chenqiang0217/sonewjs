class LoadStep {
    constructor(label='', target = [], subStep = [], description = '') {
        //no根据求解时选取的loadstep对应表格行序号进行赋值
        this.no = 0
        this.label = label
        this.target = target
        this.subStep = subStep
        this.description = description
        this.run = false
    }
}
class Substep {
    constructor(nIterativeStep = 1, alpha = 0.0, rsdl = 1.0e-6) {
        this.nIterativeStep = nIterativeStep
        this.alpha = alpha
        this.rsdl = rsdl
    }
}

export {LoadStep, Substep}
