// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })

module.exports = {
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config =>{
      config.entry('app').clear().add('./src/main-prod.js')

      //使用externals设置排除项
     // config.set('externals',{
        //vue:'Vue',
        //'vue-router':'VueRouter',
        // axios:'axios',
        // lodash:'_',
        // echarts:'echarts',
        // nprogress:'NProgress',
        // 'vue-quill-editor':'VueQuillEditor'
    // })
 })

    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config =>{
      config.entry('app').clear().add('./src/main-dev.js')
    })
  }
}