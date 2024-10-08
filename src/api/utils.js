const byNumAsec = (a, b) => {
    return a - b
}
const byNoAsec = (a, b) => {
    return a.no - b.no
}

const generateUniqueNo = (no, nos) => {
    const set = new Set(nos)
    let uniqueNo = no
    while (true) {
        if (set.has(uniqueNo)) {
            set.delete(uniqueNo)
            uniqueNo += 1
        } else {
            return uniqueNo
        }
    }
}
const stringToNumberArray = (str, splitter = ',') =>
    str.split(splitter).map(item => Number.parseFloat(item))
const SetOperation = (aSet, bSet, type) => {
    let aArr = Array.from(aSet)
    let bArr = Array.from(bSet)
    let cSet = new Set(aArr)
    switch (type) {
        case 'add':
            bArr.map(item => cSet.add(item))
            return cSet
        case 'delete':
            bArr.map(item => cSet.delete(item))
            return cSet
        case 'intersection':
            let dSet = SetOperation(aSet, bSet, 'delete')
            return SetOperation(aSet, dSet, 'delete')
    }
}
function debounce(fn, delay = 300) {
    let timer = null
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}
const sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time * 1000))
}
function base64ToFloat64Array(base64String) {
    const rawData = atob(base64String)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return new Float64Array(outputArray.buffer)
}
function float64ArrayToBase64(float64Array) {
    const blob = new Blob([float64Array.buffer])
    var reader = new FileReader()
    reader.readAsDataURL(blob)
    return new Promise((resolve, reject) => {
        reader.onload = function () {
            resolve(reader.result.split(',')[1])
        }
        reader.onerror = function (error) {
            reject(error)
        }
    })
}

class Validator {
    static AllNumber() {
        return this.map(item => Number.isFinite(item)).reduce(
            (a, b) => a && b,
            true
        )
    }
    static AllInterger() {
        return this.map(item => Number.isInteger(item)).reduce(
            (a, b) => a && b,
            true
        )
    }
    constructor(data) {
        this.data = data
        this.conditions = []
        return this
    }
    addCondition(condition) {
        this.conditions.push(condition)
        return this
    }
    validate() {
        for (const condition of this.conditions) {
            if (!condition.apply(this.data)) {
                return false
            }
        }
        return true
    }
}

export {
    byNumAsec,
    byNoAsec,
    generateUniqueNo,
    stringToNumberArray,
    SetOperation,
    debounce,
    sleep,
    base64ToFloat64Array,
    float64ArrayToBase64,
    Validator
}
