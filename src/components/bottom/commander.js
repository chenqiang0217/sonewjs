import {useMessageStore, Message} from '../../stores/message'

class Commander {
    constructor(code) {
        this.code = code
        this.command = new Function(code)
    }
    execute() {
        const messages = useMessageStore()
        const to = 'client'
        const originalConsoleLog = console.log
        console.log = (...args) => {
            const arr = []
            args.forEach(item => arr.push(o(item)))
            messages.add({
                text: arr.join(' '),
                level: Message.TYPES.INFO.LEVEL,
                to
            })
            originalConsoleLog.apply(console, args)
        }
        try {
            switch(this.code){
                case 'help':
                    console.log( 'const model = useModel() 获取模型数据\n' +
                        'const config = useConfig() 获取设置数据')
                break
                default:
                    this.command()
            }
            console.log = originalConsoleLog
        } catch (error) {
            console.log = originalConsoleLog
            throw(error)
        }
    }
}

//来自mdn
function o(t) {
    return null == t || "boolean" == typeof t ? String(t) : "number" == typeof t ? Object.is(t, -0) ? "-0" : String(t) : "bigint" == typeof t ? String(t) + "n" : "string" == typeof t ? t.includes('"') ? "'" + t + "'" : '"' + t + '"' : Array.isArray(t) ? "Array [" + r(t) + "]" : function(t) {
    // return null == t || "boolean" == typeof t ? String(t) : "number" == typeof t ? Object.is(t, -0) ? "-0" : String(t) : "bigint" == typeof t ? String(t) + "n" : "string" == typeof t ? t : Array.isArray(t) ? "Array [" + r(t) + "]" : function(t) {
        const e = t.constructor ? t.constructor.name : t;
        if ("String" === e)
            return `String { "${t.valueOf()}" }`;
        if (t === JSON)
            return "JSON {}";
        if (e.match && e.match(/^(ArrayBuffer|SharedArrayBuffer|DataView)$/))
            return e + " {}";
        if (e.match && e.match(/^(Int8Array|Int16Array|Int32Array|Uint8Array|Uint16Array|Uint32Array|Uint8ClampedArray|Float32Array|Float64Array|BigInt64Array|BigUint64Array)$/))
            return t.length > 0 ? e + " [" + r(t) + "]" : e + " []";
        if ("Symbol" === e && void 0 !== t)
            return t.toString();
        if ("Object" === e) {
            let n = ""
                , r = !0;
            for (const e in t)
                Object.prototype.hasOwnProperty.call(t, e) && (r ? r = !1 : n += ", ",
                n = n + e + ": " + o(t[e]));
            return e + " { " + n + " }"
        }
        if (!t.constructor && !t.prototype) {
            let e = ""
                , n = !0;
            for (const r in t)
                n ? n = !1 : e += ", ",
                e = e + r + ": " + o(t[r]);
            return "Object { " + e + " }"
        }
        return t
    }(t)
}
function r(t) {
    let e = "";
    for (let n = 0, a = t.length; n < a; n++)
        "string" == typeof t[n] ? e += '"' + t[n] + '"' : Array.isArray(t[n]) ? (e += "Array [",
        e += r(t[n]),
        e += "]") : e += o(t[n]),
        n < t.length - 1 && (e += ", ");
    return e
}
export {Commander}
