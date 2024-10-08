import {createApp} from 'vue'
import {createPinia} from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ContextMenu from '@imengyu/vue3-context-menu'
import {vDrag} from './directives/vDrag'
import './index.scss'
import './index.css'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import IconFront from './assets/icon/IconFront.vue'
import App from './App.vue'
import {useModelStore} from './stores/model'
import {useConfigStore} from './stores/config'

import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(ElementPlus, {
    locale: zhCn
})
app.use(ContextMenu)

app.directive('drag', vDrag)
app.component('IconFront', IconFront)
app.mount('#app')

globalThis.useModel = useModelStore
globalThis.useConfig = useConfigStore
// globalThis.help =
// 'const model = useModel() 获取模型数据\n' +
// 'const config = useConfig() 获取设置数据'

// 设置本地用户及其邮箱用于生成ras公用密钥
// git config --global user.name chenqiang0217
// git config --global user.email 419788322@qq.com
// 生成密钥后复制到github
// ssh-keygen -t rsa -b 4096 -C "419788322@qq.com"
// 测试密钥有效性
// ssh -T git@github.com
// 初始化git
// git init
// git add .
// git commit -m 'version-0.1.0'
// git remote add sonewjs https://github.com/chenqiang0217/sonewjs.git
// git pull --rebase sonewjs master
// git push -u sonewjs master
