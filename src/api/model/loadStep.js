class LoadStep {
    constructor(label='', target = [], subStep = [], description = '') {
        this.label = label
        this.target = target
        this.subStep = subStep
        this.description = description
    }
    get nSubStep() {
        return this.subStep.length
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
