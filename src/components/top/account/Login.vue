<script setup>
import { ref, watch } from 'vue'
import { useStatusStore } from '../../../stores/status'
import { useMessageStore, Message } from '../../../stores/message'
import { auth } from '../../../api/request'
import Modal from '../Modal.vue'

const status = useStatusStore()
const messages = useMessageStore()
const to = 'client'
const width = 360

const user = ref({
    username: '',
    email: '',
    password: '',
    passwordCheck: '',
    verificationCode: '',
    check: {
        username: function () {
            const regex = /^[a-zA-Z][a-zA-Z0-9_-]{3,19}$/
            return this.match(regex)
        },
        email: function () {
            const regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
            return this.match(regex)
        },
        password: function () {
            const regex = /^[a-zA-Z0-9_.+-]{6,20}$/
            return this.match(regex)
        },
        verificationCode: function () {
            const regex = /^[a-f0-9]{10,}$/
            return this.match(regex)
        }
    }
})
const validateUsername = (_, username, callback) => {
    if (user.value.check.username.apply(username)) {
        if (active.value === 'register') {
            auth.userExist(JSON.stringify({ username }))
                .then(({ authenticated = fasle }) => {
                    if (authenticated) {
                        callback()
                    }
                    else {
                        callback(new Error('用户已存在'))
                    }
                })
        }
        else{
            callback()
        }
    }
    else {
        callback(new Error('字母开头，包含数字、-、_，4~20位'))
    }
}
const validateEmail = (_, email, callback) => {
    if (user.value.check.email.apply(email)) {
        disable.value = false
        callback()
    } else {
        disable.value = true
        callback(new Error('格式错误'))
    }
}
const validatePassword = (_, password, callback) => {
    if (user.value.check.password.apply(password)) {
        callback()
    } else {
        callback(new Error('包含字母、数字、-、_，6~20位'))
    }
}
const validatePasswordCheck = (_, passwordCheck, callback) => {
    if (passwordCheck === user.value.password) {
        callback()
    } else {
        callback(new Error('密码不一致'))
    }
}
const validateVerificationCode = (_, verificationCode, callback) => {
    if (user.value.check.verificationCode.apply(verificationCode)) {
        callback()
    } else {
        callback(new Error('格式错误'))
    }
}
const rules = ref({
    username: [{ validator: validateUsername, trigger: 'blur' }],
    email: [{ validator: validateEmail, trigger: 'blur' }],
    password: [{ validator: validatePassword, trigger: 'blur' }],
    passwordCheck: [{ validator: validatePasswordCheck, trigger: 'blur' }],
    verificationCode: [{ validator: validateVerificationCode, trigger: 'blur' }]
})
const disable = ref(true)

const active = ref('login')
const activeTab = ref('login')
watch(activeTab, activeTab => {
    active.value = activeTab
})
watch(
    () => status.ui.modal.apply,
    apply => {
        if (apply) {
            status.ui.modal.apply = false
            onApply()
        }
    }
)
const register = ({ username, email, password }) => {
    const check = user.value.check
    if (check.username.apply(username) && check.email.apply(email) && check.password.apply(password)) {
        auth.register(JSON.stringify({ username, email, password }))
            .then(({ authenticated = fasle }) => {
                status.ui.tab.message.active = to
                if (authenticated) {
                    messages.add({
                        text: '注册成功',
                        level: Message.TYPES.SUCCESS.LEVEL,
                        to
                    })
                    login({ username, password })
                }
                else {
                    messages.add({
                        text: '注册失败',
                        level: Message.TYPES.ERROR.LEVEL,
                        to
                    })
                }
            })
    }
    else {
        messages.add({
            text: '输入格式错误',
            level: Message.TYPES.ERROR.LEVEL,
            to
        })
    }
}
const login = ({ username, password }) => {
    const check = user.value.check
    if (check.username.apply(username) && check.password.apply(password)) {
        auth.login(JSON.stringify({ username, password }))
            .then(({ authenticated = false }) => {
                status.ui.tab.message.active = to
                if (authenticated) {
                    status.user.logined = true
                    messages.add({
                        text: '登录成功',
                        level: Message.TYPES.SUCCESS.LEVEL,
                        to
                    })
                    setTimeout(() => {
                        status.ui.modal.show = false
                    }, 500)
                }
                else {
                    messages.add({
                        text: '登录失败',
                        level: Message.TYPES.ERROR.LEVEL,
                        to
                    })
                }
            })
    }
    else {
        messages.add({
            text: '输入格式错误',
            level: Message.TYPES.ERROR.LEVEL,
            to
        })
    }
}
const sendVerificationCode = () => {
    const username = user.value.username
    const email = user.value.email
    auth.sendVerificationCode(JSON.stringify({ username, email }))
        .then(({ authenticated = fasle }) => {
            status.ui.tab.message.active = to
            if (authenticated) {
                messages.add({
                    text: '验证码发送成功，请查收',
                    level: Message.TYPES.SUCCESS.LEVEL,
                    to
                })
            }
            else {
                messages.add({
                    text: '验证码发送失败',
                    level: Message.TYPES.ERROR.LEVEL,
                    to
                })
            }
        })
}
const resetPassword = ({ username, email, verificationCode, password, passwordCheck }) => {
    const check = user.value.check
    if (check.username.apply(username) && check.email.apply(email) && check.verificationCode.apply(verificationCode)
        && check.password.apply(password) && password === passwordCheck) {
        auth.resetPassword(JSON.stringify({ username, email, verificationCode, password }))
            .then(({ authenticated = fasle }) => {
                status.ui.tab.message.active = to
                if (authenticated) {
                    messages.add({
                        text: '重置密码成功',
                        level: Message.TYPES.SUCCESS.LEVEL,
                        to
                    })
                }
                else {
                    messages.add({
                        text: '重置密码失败',
                        level: Message.TYPES.ERROR.LEVEL,
                        to
                    })
                }
            })
    }
    else {
        messages.add({
            text: '输入格式错误',
            level: Message.TYPES.ERROR.LEVEL,
            to
        })
    }
}
function onApply() {
    switch (active.value) {
        case 'login':
            login(user.value)
            break
        case 'register':
            register(user.value)
            break
        case 'resetPassword':
            resetPassword(user.value)
    }
}
</script>

<template>
    <Modal title="" :width="width" :apply="active == 'register' ? '注册' : active == 'login' ? '登录' : '重置密码'">
        <el-tabs v-model="activeTab">
            <el-tab-pane name="login">
                <template #label>
                    <span :class="active == 'login' || active == 'resetPassword' ? '' : 'inactive'">
                        <IconFront iconName="person" />登录
                    </span>
                </template>
            </el-tab-pane>
            <el-tab-pane name="register">
                <template #label>
                    <span :class="active == 'register' ? '' : 'inactive'">
                        <IconFront iconName="person-add" />注册
                    </span>
                </template>
            </el-tab-pane>
        </el-tabs>
        <el-form :model="user" label-position="top" :rules="rules" status-icon>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="user.username" placeholder="" clearable />
            </el-form-item>
            <el-form-item v-show="active == 'register' || active == 'resetPassword'" prop="email">
                <template #label>
                    <div style="display: flex;">
                        <el-text>邮箱</el-text>
                        <el-link type="danger" v-show="active == 'resetPassword'" :underline="false"
                            style="margin-left: auto;" @click="active = 'login'">我有密码</el-link>
                    </div>
                </template>
                <el-input v-model="user.email" placeholder="">
                    <template #suffix>
                        <el-link type="success" v-show="active !== 'register'" :underline="false" style="margin: 0;"
                            @click="sendVerificationCode()" :disabled="disable">发送验证码</el-link>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item label="验证码" v-show="active == 'resetPassword'" prop="verificationCode">
                <el-input v-model="user.verificationCode" placeholder="" clearable />
            </el-form-item>
            <el-form-item prop="password">
                <template #label>
                    <div style="display: flex;">
                        <el-text>{{ active == 'resetPassword' ? '新密码' : '密码' }}</el-text>
                        <el-link type="danger" v-show="active == 'login'" :underline="false" style="margin-left: auto;"
                            @click="active = 'resetPassword'">没有密码？</el-link>
                    </div>
                </template>
                <el-input v-model="user.password" type="password" placeholder="" show-password />
            </el-form-item>
            <el-form-item :label="active == 'resetPassword' ? '新密码确认' : '密码确认'" v-show="active != 'login'"
                prop="passwordCheck">
                <el-input v-model="user.passwordCheck" type="password" placeholder="" show-password />
            </el-form-item>
        </el-form>
    </Modal>
</template>

<style scoped>
.inactive {
    color: var(--el-text-color-regular);
}

.el-link {
    font-size: 12px;
}
</style>
