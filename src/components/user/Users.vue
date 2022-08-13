<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card class="box-card">
            <div>

                <el-row :gutter="20">
                    <el-col :span="18">
                        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                        </el-input>
                    </el-col>
                    <el-col :span="6">
                        <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
                    </el-col>
                </el-row>

                <!-- 用户列表区 -->
                <el-table :data="userList" border stripe style="width: 100%">
                    <el-table-column label="#" width="50" type="index">
                    </el-table-column>
                    <el-table-column prop="username" label="姓名">
                    </el-table-column>
                    <el-table-column prop="email" label="邮箱">
                    </el-table-column>
                    <el-table-column prop="mobile" label="电话">
                    </el-table-column>
                    <el-table-column prop="role_name" label="角色">
                    </el-table-column>
                    <el-table-column label="状态">
                        <template slot-scope="scope">
                            <el-switch @change="userStateChange(scope.row)" v-model="scope.row.mg_state"
                                active-color="#13ce66" inactive-color="#ff4949">
                            </el-switch>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180">
                        <template slot-scope="scope">
                            <!-- 修改按钮 -->
                            <el-tooltip class="item" effect="dark" content="修改用户信息" placement="top" :enterable="false">
                                <el-button @click="showEdit(scope.row.id)" type="primary" icon="el-icon-edit"
                                    size="mini">
                                </el-button>
                            </el-tooltip>

                            <!-- 删除按钮 -->
                            <el-tooltip class="item" effect="dark" content="删除用户" placement="top" :enterable="false">
                                <el-button @click="removeUserById(scope.row.id)" type="danger" icon="el-icon-delete"
                                    size="mini"></el-button>
                            </el-tooltip>
                            <!-- 分配角色按钮 -->
                            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                                <el-button type="warning" icon="el-icon-setting" size="mini"
                                    @click="setRole(scope.row)"></el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页区 -->
                <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper" :total="total">
                </el-pagination>
            </div>
        </el-card>

        <!-- 添加用户的对话框 -->
        <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addDialogClose">
            <el-form ref="formRef" :model="addForm" label-width="70px" :rules="rules">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户信息对话框 -->
        <el-dialog title="修改用户对话框" :visible.sync="dialogVisible_edit" width="50%" @close="editDialogClose">
            <el-form ref="editFormRef" :model="editForm" label-width="70px" :rules="rules">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible_edit = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配角色的对话框 -->
        <el-dialog title="分配角色" :visible.sync="dialogVisible_setRole" width="50%" @close="setRoleDialogClose">
            <div>
                <p>当前用户：{{ userInfo.username }}</p>
                <p>当前角色：{{ userInfo.role_name }}</p>
                <p>分配新角色：
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible_setRole = false">取 消</el-button>
                <el-button type="primary" @click="saveRole">确 定</el-button>
            </span>
        </el-dialog>


    </div>
</template>

<script>
export default {
    created() {
        this.getUserList()
    },
    data() {
        // 自定义验证规则
        var checkEmail = (rule, value, callback) => {
            const regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
            if (regEmail.test(value)) {
                // 校验通过
                return callback()
            }
            return callback(new Error('请输入有效的邮箱'))
        }
        var checkMobile = (rule, value, callback) => {
            const regMobile = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/

            if (regMobile.test(value)) {
                // 校验通过
                return callback()
            }
            return callback(new Error('请输入有效的手机号'))
        }
        return {
            // 获取用户列表的参数对象
            queryInfo: {
                query: '',// 查询参数 | 可以为空
                pagenum: 1,//当前页码 | 不能为空
                pagesize: 2,//每页显示条数 | 不能为空
            },
            userList: [],
            total: 0,   //总数据条数
            dialogVisible: false,

            // 添加用户的表单数据
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },

            dialogVisible_edit: false,
            dialogVisible_setRole: false,
            // 修改信息表单数据
            editForm: {},
            // 需要被分配角色的用户
            userInfo: {},
            // 所有角色
            rolesList: [],
            // 已选中的id
            selectedRoleId: '',


            // 表单验证规则
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ],
            }
        };
    },
    methods: {
        async getUserList() {
            // 接口文档中要求要有请求参数 所以使用params 注意params是对象所以要赋一个对象
            const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
            if (res.meta.status !== 200) {
                return this.$message.error('获取用户列表失败')
            }
            this.userList = res.data.users
            this.total = res.data.total
            console.log(res)
        },
        // 监听pagesize改变事件
        handleSizeChange(newSize) {
            console.log(newSize)
            // 改变了
            this.queryInfo.pagesize = newSize
            // 发起请求
            this.getUserList()
        },
        // 监听 页码值 事件
        handleCurrentChange(newPage) {
            console.log(newPage)
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        async userStateChange(userinfo) {
            console.log(userinfo)
            const { data: res } = await this.$http.put(`/users/${userinfo.id}/state/${userinfo.mg_state}`)
            if (res.meta.status !== 200) {
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('更新失败')
            }
            this.$message.success('更新成功')
        },
        // 对话框关闭事件
        addDialogClose() {
            this.$refs.formRef.resetFields()
        },
        //确认添加用户
        addUser() {
            this.$refs.formRef.validate(async valid => {
                if (!valid) return //预校验未通过
                // 发起添加用户的请求
                const { data: res } = await this.$http.post('/users', this.addForm)
                if (res.meta.status !== 201) {
                    // 请求失败
                    return this.$message.error('添加用户失败')
                }
                this.$message.success('添加用户成功')
                this.dialogVisible = false
                this.getUserList()
            })
        },

        async showEdit(id) {
            const { data: res } = await this.$http.get('/users/' + id)
            if (res.meta.status !== 200) {
                // 请求失败
                return this.$message.error('获取用户信息失败')
            }
            this.editForm = res.data
            this.dialogVisible_edit = true
        },
        editDialogClose() {
            this.$refs.editFormRef.resetFields()
        },
        // 确认修改用户信息
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return //预校验未通过
                // 发起添加用户的请求

                const { data: res } = await this.$http.put('/users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
                if (res.meta.status !== 200) {
                    // 请求失败
                    return this.$message.error('修改用户失败')
                }
                this.$message.success('修改用户成功')
                this.dialogVisible_edit = false
                this.getUserList()
            })
        },
        // 根据id删除用户信息
        async removeUserById(id) {
            const configRemove = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const { data: res } = await this.$http.delete('/users/' + id)
                if (res.meta.status !== 200) {
                    // 请求失败
                    return this.$message.error('删除用户失败')
                }
                this.getUserList()
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
            }).catch(err => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                })
            })

        },
        async setRole(user) {
            this.userInfo = user
            // 在展示对话框之前 先获取所有能分配的角色列表数据
            const { data: res } = await this.$http.get('/roles')
            if (res.meta.status !== 200) {
                // 请求失败
                return this.$message.error('获取角色信息失败')
            }
            this.rolesList = res.data

            this.dialogVisible_setRole = true
        },
        async saveRole() {
            if (!this.selectedRoleId) {
                return this.$message.error('请选择')
            }
            const { data: res } = await this.$http.put(`/users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
            if (res.meta.status !== 200) {
                // 请求失败
                return this.$message.error('分配角色失败')
            }
            this.$message({
                type: 'success',
                message: '分配角色成功!'
            })
            this.getUserList()
            this.dialogVisible_setRole = false
        },
        setRoleDialogClose(){
            this.selectedRoleId =''
            this.userInfo = {}
        }
    }
};
</script>
<style lang="less" scoped>
.el-table {
    margin-top: 20px;
}

.el-pagination {
    margin-top: 20px;
}
</style>