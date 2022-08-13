<template>
    <el-container class="home-container">
        <el-header>
            <!-- 头部区域 -->
            <div>
                <img src="@/assets/headlogo.png" alt="">
                <span>獠的后台管理系统</span>
            </div>
            <el-button type="info" @click="onLogout">退出</el-button>
        </el-header>

        <el-container>
            <!-- 主体区域 -->
            <!-- 左侧区域 -->
            <el-aside :width="isCollapse?'64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 使用elementui 提供的 router=true 属性 将二级菜单的index值 作为路由跳转地址 -->
                <el-menu :default-active="activePath" router :collapse="isCollapse" :collapse-transition="false" background-color="#333744" text-color="#fff" active-text-color="#409eff" :unique-opened="true">
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                        <template slot="title">
                            <!-- 图标 -->
                            <i class="el-icon-location"></i>
                            <!-- 文本 -->
                            <span>{{ item.authName }}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/'+subItem.path" @click="saveNavState('/'+subItem.path)" v-for="subItem in item.children" :key="subItem.id">
                            <!-- 图标 -->
                            <i class="el-icon-menu"></i>
                            <!-- 文本 -->
                            <span>{{ subItem.authName }}</span>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <!-- 右侧区域 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    created() {
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    data() {
        return {
            menulist: [],
            isCollapse:false,
            // 被激活的地址
            activePath:''
        };
    },
    methods: {
        onLogout() {
            // 清空token
            window.sessionStorage.clear()
            // 跳转到登录页面
            this.$router.push('/login')
        },
        async getMenuList() {
            // 获取所有的菜单
            const { data: res } = await this.$http.get('/menus')
            if (res.meta.status !== 200) return this.$message.error('res.meta.msg')
            this.menulist = res.data
            console.log(res)
        },
        toggleCollapse(){
            this.isCollapse = !this.isCollapse
        },
        // 保存连接的激活状态
        saveNavState(path){
            window.sessionStorage.setItem('activePath',path)
            this.activePath = path
        }
    }
};
</script>
<style lang="less" scoped>
.home-container {
    height: 100%;
}

.el-header {
    background-color: #373D41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

    >div {
        display: flex;
        align-items: center;

        span {
            margin-left: 15px;
        }
    }
}

.el-aside {
    background-color: #333744;

    .el-menu {
        border-right: 0;
    }
}

.el-main {
    background-color: #eaedf1;
}
.toggle-button{
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor:pointer
}
</style>