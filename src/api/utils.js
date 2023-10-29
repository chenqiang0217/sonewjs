const sortNumber = (a, b) => {
    return a - b
}
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
const sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time * 1000))
}
function base64ToFloat64Array(base64String) {
    const rawData = atob(base64String)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return new Float64Array(outputArray.buffer)
}


export { sortNumber, SetOperation, debounce, sleep, base64ToFloat64Array }