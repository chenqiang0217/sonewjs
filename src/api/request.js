import axios from 'axios'
import {fetchEventSource} from '@microsoft/fetch-event-source'
import {useMessageStore, Message} from '../stores/message'

const service = axios.create({
    baseURL: '/api',
    withCredentials: false, // send cookies when cross-domain requests
    timeout: 1000000
    //multipart/form-data | application/json
    // headers: {'Content-Type': 'application/json'},
})

service.interceptors.request.use(
    config => {
        // config.headers['Authorization'] = localStorage.getItem("token")
        return config
    },
    error => {
        // console.log(error)
        return Promise.reject(error)
    }
)

service.interceptors.response.use(
    res => {
        let data = res.data
        // 处理自己的业务逻辑，比如判断 token 是否过期等等
        // 代码块
        return data
    },
    error => {
        let message = ''
        if (error && error.response) {
            switch (error.response.status) {
                case 302:
                    message = '接口重定向了！'
                    break
                case 400:
                    message = '参数不正确！'
                    break
                case 401:
                    message = '您未登录，或者登录已经超时，请先登录！'
                    break
                case 403:
                    message = '您没有权限操作！'
                    break
                case 404:
                    message = `请求地址出错: ${error.response.config.url}`
                    break
                case 408:
                    message = '请求超时！'
                    break
                case 409:
                    message = '系统已存在相同数据！'
                    break
                case 500:
                    message = '服务器内部错误！'
                    break
                case 501:
                    message = '服务未实现！'
                    break
                case 502:
                    message = '网关错误！'
                    break
                case 503:
                    message = '服务不可用！'
                    break
                case 504:
                    message = '服务暂时无法访问，请稍后再试！'
                    break
                case 505:
                    message = 'HTTP 版本不受支持！'
                    break
                default:
                    message = '异常问题，请联系管理员！'
                    break
            }
        }
        return Promise.reject(message)
    }
)

const user = {
    register: data => {
        return service({
            url: '/user/register/',
            method: 'post',
            data
        })
    },
    login: data => {
        return service({
            url: '/user/login/',
            method: 'post',
            data
        })
    }
}

const task = {
    run: async (data, handleData) => {
        const controller = new AbortController()
        const messages = useMessageStore()
        const to = 'server'
        await fetchEventSource('/api/task/run/', {
            method: 'post',
            headers: {
                'Content-Type': 'text/event-stream',
            },
            body: data,
            signal: controller.signal,
            async onopen(response) {
                if (response.ok) {
                    messages.add({
                        text: '服务器连接成功',
                        level: Message.TYPES.SUCCESS.LEVEL,
                        to
                    })
                    return
                } else if (
                    response.status >= 400 &&
                    response.status < 500 &&
                    response.status !== 429
                ) {
                    messages.add({
                        text: '服务器连接错误',
                        level: Message.TYPES.ERROR.LEVEL,
                        to
                    })
                    controller.abort()
                } else {
                    messages.add({
                        text: '服务器内部错误',
                        level: Message.TYPES.ERROR.LEVEL,
                        to
                    })
                    controller.abort()
                }
            },
            onmessage(msg) {
                handleData(JSON.parse(msg.data))
            },
            onclose() {
                messages.add({
                    text: '服务器连接断开',
                    level: Message.TYPES.WARNING.LEVEL,
                    to
                })
                controller.abort()
            },
            onerror(err) {
                //设置一个大值，等待controller起作用
                const retryInterval = 1.0e6
                messages.add({
                    text: '服务器内部错误',
                    level: Message.TYPES.ERROR.LEVEL,
                    to
                })
                controller.abort()
                return retryInterval
            }
        })
    }
}

export {user, task}
