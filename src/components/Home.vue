<template>
  <div>
    <el-button type="warning" round @click="onLogout">退出</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
    };
  },
  methods:{
    onLogout(){
        // 清空token
        window.sessionStorage.clear()
        // 跳转到登录页面
        this.$router.push('/login')
    }
  }
};
</script>
<style lang="less" scoped>
</style>