import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import '@/assets/CSS/global.css'
// 导入图标
import '@/assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'

Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
// 设置axios请求拦截器
axios.interceptors.request.use(config => {
  // 这里在请求头加上自定义信息 注意！！Authorization是自定义信息
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须返回config
  return config
})
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
