import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import ContextMenu from '@imengyu/vue3-context-menu'
import router from './router/index.js'
import { vDrag } from './directives/vDrag'
import './index.scss'
import './index.css'
// import 'element-plus/theme-chalk/dark/css-vars.css'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import IconFront from './assets/icon/IconFront.vue'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(ElementPlus)
app.use(router)
app.use(ContextMenu)
app.directive('drag', vDrag)
app.component('IconFront', IconFront)
app.mount('#app')

