import axios from 'axios'
import Cookies from 'js-cookie'
import {fetchEventSource} from '@microsoft/fetch-event-source'
import {useMessageStore, Message} from '../stores/message'

const service = axios.create({
    baseURL: '/api',
    withCredentials: false, // send cookies when cross-domain requests
    timeout: 5000
})

service.interceptors.request.use(
    config => {
        const csrftoken = Cookies.get('csrftoken')
        if (csrftoken !== void 0) {
            config.headers['X-CSRFToken'] = Cookies.get('csrftoken')
        }
        return config
    },
    error => {
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
        // return Promise.reject(error)
    }
)

const auth = {
    register: data => {
        return service({
            url: '/auth/register/',
            method: 'post',
            data
        })
    },
    userExist: data => {
        return service({
            url: '/auth/userExist/',
            method: 'post',
            data
        })
    },
    login: data => {
        return service({
            url: '/auth/login/',
            method: 'post',
            data
        })
    },
    sendVerificationCode: data => {
        return service({
            url: '/auth/sendVerificationCode/',
            method: 'post',
            data
        })
    },
    resetPassword: data => {
        return service({
            url: '/auth/resetPassword/',
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
        const headers = {
            'Content-Type': 'text/event-stream'
        }
        const csrftoken = Cookies.get('csrftoken')
        if (csrftoken !== void 0) {
            headers['X-CSRFToken'] = csrftoken
        }
        await fetchEventSource('/api/task/run/', {
            method: 'post',
            headers: headers,
            openWhenHidden: true,
            body: data,
            signal: controller.signal,
            async onopen(response) {
                if (response.ok) {
                    messages.add({
                        text: '服务器连接成功',
                        level: Message.TYPES.SUCCESS.LEVEL,
                        to
                    })
                } else if (
                    response.status >= 400 &&
                    response.status < 500 &&
                    response.status !== 429
                ) {
                    messages.add({
                        text: '服务器连接错误：' + response.status,
                        level: Message.TYPES.ERROR.LEVEL,
                        to
                    })
                    controller.abort()
                } else {
                    messages.add({
                        text: '服务器连接错误：' + response.status,
                        level: Message.TYPES.ERROR.LEVEL,
                        to
                    })
                    controller.abort()
                }
            },
            onmessage(response) {
                switch (Number(response.id)) {
                    case -2:
                        messages.add({
                            text: '未登录',
                            level: Message.TYPES.ERROR.LEVEL,
                            to
                        })
                        break
                    case -1:
                        messages.add({
                            text: '用户名或密码错误',
                            level: Message.TYPES.ERROR.LEVEL,
                            to
                        })
                        break
                    case 0:
                        const {user, node, elem} = JSON.parse(response.data)
                        messages.add({
                            text: '当前用户：' + user,
                            level: Message.TYPES.SUCCESS.LEVEL,
                            to
                        })
                        messages.add({
                            text:
                                '节点数：' + node + '，单元数：' + elem,
                            level: Message.TYPES.SUCCESS.LEVEL,
                            to
                        })
                        messages.add({
                            text: '获取计算结果',
                            level: Message.TYPES.INFO.LEVEL,
                            to,
                            animation: true
                        })
                        break
                    default:
                        handleData(JSON.parse(response.data))
                }
            },
            onclose(response) {
                messages.add({
                    text: '服务器连接断开',
                    level: Message.TYPES.WARNING.LEVEL,
                    to
                })
                controller.abort()
            },
            onerror(error) {
                messages.add({
                    text: '服务器内部错误',
                    level: Message.TYPES.ERROR.LEVEL,
                    to
                })
                controller.abort()
                throw error
            }
        })
    }
}

export {auth, task}
