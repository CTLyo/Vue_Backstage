<template>
  <div class="login_container">
    <div class="login_box">
        <div class="avatar_box">
            <!-- 头像区 -->
            <img src="../assets/logo.png" alt="">
        </div>
        <!-- 登录表单区 -->
            <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima">
                    </el-input>
                </el-form-item>
                <!-- 按钮 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetForm">重置</el-button>
                </el-form-item>

            </el-form>   
    </div>
    <div class="anamtion">
        <div class="mountain"></div>
        <div class="bear"></div>
    </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            loginForm: {
                // 登陆表单的数据
                username: '',
                password: ''
            },
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        resetForm() {
            this.$refs.loginFormRef.resetFields()
        },
        login() {
            this.$refs.loginFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.post('/login', this.loginForm)
                if (res.meta.status !== 200) return this.$message.error('登陆失败')
                this.$message.success('登陆成功')
                // 登录成功后将后端相应回来的token存储到 sessionStorage 中
                window.sessionStorage.setItem('token', res.data.token)
                // 通过编程式导航跳转到后台主页 路由地址是 /home
                this.$router.push('/home')
            })
        }
    }
};
</script>
<style lang="less" scoped>
.login_container {
    background-color: #2b4b6b;
    height: 100%;
}

.login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    z-index: 999;
    left: 50%;

    top:35%;
    transform: translate(-50%,-50%);


    .avatar_box {
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;

        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }
}

.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}

.btns {
    display: flex;
    justify-content: flex-end;
}
.anamtion{
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 200px;
    background-color: #cce5ff;
}
.mountain{
    width: 100%;
    height: 500px;
    position: absolute;
    top: -470px;
    background: url(@/assets/山.png) repeat-x ;
    background-position: left;
    animation: moun 20s linear infinite;
}
.bear{
    width: 200px;
    height: 100px;
    position: absolute;
    bottom: 10%;
    background: url(@/assets/熊.png) no-repeat;
    animation: bear 0.5s steps(8) infinite,bearCam 2s forwards;
}
@keyframes moun{
    0%{
        background-position: 0 200px;
    }
    100%{
        background-position: -3840px 200px;
    }
}
@keyframes bear{
    0%{
        background-position: 0 0;
    }
    100%{
        background-position: -1600px 0;
    }
}
@keyframes bearCam{
    0%{
        left: 0;
    }
    100%{
        left: 50%;
        transform: translateX(-100px);
    }
}
</style>