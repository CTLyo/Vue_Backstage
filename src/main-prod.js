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
import TreeTable from 'vue-table-with-tree-grid'
// 导入editor
 import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入nprogress
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
// 在request 拦截器中展示进度条 Nprogress.start()
// 设置axios请求拦截器
axios.interceptors.request.use(config => {
  Nprogress.start()
  // 这里在请求头加上自定义信息 注意！！Authorization是自定义信息
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须返回config
  return config
})

// 在response 拦截器中隐藏进度条 Nprogress.done()
axios.interceptors.response.use(config =>{
  Nprogress.done()
  return config
})
Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)
// 注册editor
Vue.use(VueQuillEditor)

// 全局过滤器
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth()+1+'').padStart(2,'0')
  const d = (dt.getDate()+'').padStart(2,'0')

  const hh = (dt.getHours()+'').padStart(2,'0')
  const mm = (dt.getMinutes()+'').padStart(2,'0')
  const ss = (dt.getSeconds()+'').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
