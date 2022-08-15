import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '@/components/Login.vue'
// import Home from '@/components/Home.vue'
// import Welcome from '@/components/Welcome.vue'
// import Users from '@/components/user/Users.vue'
// import Rights from '@/components/power/Rights.vue'
// import Roles from '@/components/power/Roles.vue'
// import Cate from '@/components/goods/Cate.vue'
// import Params from '@/components/goods/Params.vue'
// import GoodsList from '@/components/goods/List.vue'
// import AddGood from '@/components/goods/Add.vue'
// import Order from '@/components/order/Order.vue'
// import Report from '@/components/report/Report.vue'
const Login = () => import('@/components/Login.vue')
const Home = () => import('@/components/Home.vue')
const Welcome = () => import('@/components/Welcome.vue')
const Users = () => import('@/components/user/Users.vue')
const Rights = () => import('@/components/power/Rights.vue')
const Roles = () => import('@/components/power/Roles.vue')
const Cate = () => import('@/components/goods/Cate.vue')
const Params = () => import('@/components/goods/Params.vue')
const GoodsList = () => import('@/components/goods/List.vue')
const AddGood = () => import('@/components/goods/Add.vue')
const Order = () => import('@/components/order/Order.vue')
const Report = () => import('@/components/report/Report.vue')


Vue.use(VueRouter)

const router = new VueRouter ({
  routes:[
    {path:'/', redirect:'/login'},
    {path:'/login', component:Login},
    {path:'/home',component:Home,redirect:'/welcome',children:[
      {path:'/welcome',component:Welcome},
      {path:'/users',component:Users},
      {path:'/rights',component:Rights},
      {path:'/roles',component:Roles},
      {path:'/categories',component:Cate},
      {path:'/params',component:Params},
      {path:'/goods',component:GoodsList},
      {path:'/goods/add',component:AddGood},
      {path:'/orders',component:Order},
      {path:'/reports',component:Report}
    ]},
  ]
})

// 挂载导航守卫
router.beforeEach((to,from,next)=>{
  // to 将要访问的路径
  // from 从哪个路径跳转过来的
  // next 放行函数 next()：放行  next():强制跳转
  if(to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router
