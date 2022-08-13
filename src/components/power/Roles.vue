<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card class="box-card">
            <el-row>
                <el-col :span="24">
                    <el-button type="primary" @click="dialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <div>
                <el-table :data="rolesList" stripe style="width: 100%">
                    <!-- 展开列 -->
                    <el-table-column type="expand">
                        <template slot-scope="scope">

                            <el-row :class="['bdbottom', 'vcenter', index1 === 0 ? 'bdtop' : '']"
                                v-for="(item1, index1) in scope.row.children" :key="item1.id">
                                <!-- 渲染一级权限 -->
                                <el-col :span="5">
                                    <el-tag closable @close="removeRightById(scope.row, item1.id)">
                                        {{ item1.authName }}
                                    </el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <!-- 渲染二级和三级权限 -->
                                <el-col :span="19">
                                    <!-- 通过v-for 渲染二三级权限 -->
                                    <el-row :class="['vcenter', index2 == 0 ? '' : 'bdtop']"
                                        v-for="(item2, index2) in item1.children" :key="item2.id">
                                        <el-col :span="6">
                                            <el-tag type="success" closable
                                                @close="removeRightById(scope.row, item2.id)">
                                                {{ item2.authName }}
                                            </el-tag>
                                            <i class="el-icon-caret-right"></i>
                                        </el-col>
                                        <el-col :span="18">
                                            <el-tag v-for="(item3, index3) in item2.children" :key="item3.id"
                                                type="warning" closable @close="removeRightById(scope.row, item3.id)">
                                                {{ item3.authName }}
                                            </el-tag>
                                        </el-col>
                                    </el-row>
                                </el-col>
                            </el-row>

                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="#">
                    </el-table-column>
                    <el-table-column prop="roleName" label="角色名称">
                    </el-table-column>
                    <el-table-column prop="roleDesc" label="角色描述">
                    </el-table-column>
                    <el-table-column label="操作" width="300">
                        <template slot-scope="scope">
                            <!-- 修改按钮 -->
                            <el-button @click="showEdit(scope.row.id)" size="mini" type="primary" icon="el-icon-edit">编辑
                            </el-button>
                            <!-- 删除按钮 -->
                            <el-button @click="removeRoleById(scope.row.id)" size="mini" type="danger"
                                icon="el-icon-delete">删除</el-button>
                            <!-- 分配按钮 -->
                            <el-button @click="showSetRightDialog(scope.row)" size="mini" type="warning" icon="el-icon-setting">
                                分配权限</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>

        <!-- 添加角色的对话框 -->
        <el-dialog title="添加角色" :visible.sync="dialogVisible" width="50%" @close="addDialogClose">
            <el-form ref="addFormRef" :model="addForm" label-width="120px" :rules="rules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改角色对话框 -->
        <el-dialog title="修改角色" :visible.sync="dialogVisible_edit" width="50%" @close="editDialogClose">
            <el-form ref="editFormRef" :model="editForm" label-width="120px" :rules="rules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" rop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible_edit = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配权限对话框 -->
        <el-dialog title="分配权限" :visible.sync="dialogVisible_rights" width="50%" @close="SetRightDialogClose">
            <!-- 树形控件 -->
            <el-tree ref="treeRef" :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible_rights = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>


export default {
    created() {
        this.getRolesList()
    },
    methods: {
        // 获取所有角色列表
        async getRolesList() {
            const { data: res } = await this.$http.get('/roles')
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败')
            }
            this.rolesList = res.data
        },
        addDialogClose() {
            this.$refs.addFormRef.resetFields()
        },
        editDialogClose() {
            this.$refs.editFormRef.resetFields()
        },
        addRole() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                // 发起请求
                const { data: res } = await this.$http.post('/roles', this.addForm)
                if (res.meta.status !== 201) {
                    // 请求失败
                    return this.$message.error('添加用户失败')
                }
                //console.log(res)
                this.$message.success('添加角色成功')
                this.getRolesList()
            })
            this.dialogVisible = false
        },
        async removeRoleById(id) {
            const configRemove = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const { data: res } = await this.$http.delete('/roles/' + id)
                if (res.meta.status !== 200) {
                    // 请求失败
                    return this.$message.error('删除用户失败')
                }
                this.getRolesList()
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
        async showEdit(id) {
            const { data: res } = await this.$http.get('/roles/' + id)
            if (res.meta.status !== 200) {
                // 请求失败
                return this.$message.error('获取角色信息失败')
            }
            this.editForm = res.data
            this.dialogVisible_edit = true
        },
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                // 发起请求
                const { data: res } = await this.$http.put('/roles/' + this.editForm.roleId, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })

                if (res.meta.status !== 200) {
                    // 请求失败
                    return this.$message.error('修改角色失败')
                }

                this.$message.success('修改角色成功')
                this.getRolesList()
            })
            this.dialogVisible_edit = false
        },
        // 根据Id删除三级权限
        async removeRightById(role, rightId) {
            // 弹框提示
            const configRemove = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const { data: res } = await this.$http.delete(`/roles/${role.id}/rights/${rightId}`)
                if (res.meta.status !== 200) {
                    // 请求失败
                    return this.$message.error('删除权限失败')
                }
                // 这里能直接赋值？？直接改变
                console.log(res)
                role.children = res.data

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
        // 显示分配权限对话框
        async showSetRightDialog(role) {
            this.roleId = role.id
            // 获取所有权限
            const {data:res} = await this.$http.get('/rights/tree')
            if (res.meta.status !== 200) {
                    // 请求失败
                    return this.$message.error('获取权限失败')
                }
            this.rightsList = res.data
            // 调用递归函数获取所有三级节点
            this.getdefKeys(role,this.defKeys)
            

            this.dialogVisible_rights = true
        },

        // 通过递归的形式获取角色下所有三级权限id 绑定到 defKeys 数组中
        getdefKeys(node,arr){
            // 如果node节点不含children属性 则是三级权限节点
            if(!node.children){
                return arr.push(node.id)
            }
            node.children.forEach(item => this.getdefKeys(item,arr))
        },
        SetRightDialogClose(){
            this.defKeys = []
        },
        async allotRights(){
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            //使用逗号拼接数组
            const idStr = keys.join(',')
            const {data:res} = await this.$http.post(`/roles/${this.roleId}/rights`,{rids:idStr})
             if (res.meta.status !== 200) {
                    // 请求失败
                    return this.$message.error('配置权限失败')
                }
            this.$message.success('分配权限成功')
            this.getRolesList()
            this.dialogVisible_rights = false
        }
    },
    data() {
        return {
            // 所有角色列表数据
            rolesList: [],
            // 所有权限数据
            rightsList:[],
            roleId:'',
            // 树形控件的属性绑定对象
            treeProps:{
                label:'authName',
                children:'children'
            },
            //树形控件 默认展开的id
            defKeys:[],
            //控制添加角色对话框开关
            dialogVisible: false,
            dialogVisible_edit: false,
            dialogVisible_rights: false,
            addForm: {
                roleName: '',
                roleDesc: ''
            },
            editForm: {},
            // 表单验证规则
            rules: {
                roleName: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
                ]
            }
        };
    },
};
</script>
<style lang="less" scoped>
.el-table {
    margin-top: 20px;
}

.el-tag {
    margin: 7px;
}

.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}

.vcenter {
    display: flex;
    align-items: center;
}
</style>