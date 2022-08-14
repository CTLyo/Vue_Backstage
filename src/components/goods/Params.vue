<template>
    <div>

        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <!-- 头部警告区域 -->
            <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon>
            </el-alert>

            <!-- 选择商品分类区 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 商品选择框 -->
                    <el-cascader v-model="selectedCateKeys" :options="cateList"
                        :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
                        @change="handleChange"></el-cascader>
                </el-col>
            </el-row>

            <!-- tabs标签页 -->
            <el-tabs v-model="activeName" @tab-click="handleTabsClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="dialogVisible_add = true">
                        添加参数
                    </el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" stripe border style="width: 100%">
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">
                                    {{ item }}
                                </el-tag>
                                <!-- 添加标签 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInputRef" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#">
                        </el-table-column>
                        <el-table-column prop="attr_name" label="参数名称">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <!-- 编辑按钮 -->
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                    @click="showEdit(scope.row.attr_id)">编辑</el-button>
                                <!-- 删除按钮 -->
                                <el-button type="danger" icon="el-icon-delete-solid" size="mini"
                                    @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>


                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="dialogVisible_add = true">
                        添加属性
                    </el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" stripe border style="width: 100%">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">
                                    {{ item }}
                                </el-tag>
                                <!-- 添加标签 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInputRef" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#">
                        </el-table-column>
                        <el-table-column prop="attr_name" label="属性名称">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <!-- 编辑按钮 -->
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                    @click="showEdit(scope.row.attr_id)">编辑
                                </el-button>
                                <!-- 删除按钮 -->
                                <el-button type="danger" icon="el-icon-delete-solid" size="mini"
                                    @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数对话框 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="dialogVisible_add" width="50%" @close="addDialogClose">
            <!-- 表单 -->
            <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible_add = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑对话框 -->
        <el-dialog :title="'修改' + titleText" :visible.sync="dialogVisible_edit" width="50%" @close="editDialogClose">
            <!-- 表单 -->
            <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible_edit = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    created() {
        this.getCateList()
    },
    data() {
        return {
            cateList: [],
            //级联选择框选择到的分类id数组
            selectedCateKeys: [],
            activeName: 'many',
            //动态参数的响应数据
            manyTableData: [],
            // 静态属性的相应数组
            onlyTableData: [],
            dialogVisible_add: false,
            dialogVisible_edit: false,
            addForm: {},
            editForm: {},


            // 验证规则
            rules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' },
                ]
            }
        };
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('/categories')
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类失败')
            }
            this.cateList = res.data
        },
        //级联选择器中选中项发生变化时触发函数
        handleChange() {
            this.getParamsData()

        },
        //选中标签页时的处理函数
        handleTabsClick() {
            this.getParamsData()
        },
        async getParamsData() {
            if (this.selectedCateKeys.length !== 3) {
                //选中的不是三级分类
                this.selectedCateKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                return
            }
            // 选中了三级分类

            const { data: res } = await this.$http.get(`/categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
            if (res.meta.status !== 200) return this.$message.error('请求失败')
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                item.inputVisible = false
                item.inputValue = ''
            })
            //console.log(res.data)
            if (this.activeName === 'many') {
                //获取的是动态参数
                this.manyTableData = res.data
            } else {
                this.onlyTableData = res.data
            }
        },
        addDialogClose() {
            this.$refs.addFormRef.resetFields()
        },
        addParams() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.post(`/categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
                if (res.meta.status !== 201) return this.$message.error('添加失败')
                this.$message.success('添加成功')
                this.getParamsData()
                this.dialogVisible_add = false
            })
        },
        async showEdit(attr_id) {
            const { data: res } = await this.$http.get(`/categories/${this.cateId}/attributes/${attr_id}`, { params: { attr_sel: this.activeName } })
            if (res.meta.status !== 200) return this.$message.error('请求失败')
            this.editForm = res.data
            this.dialogVisible_edit = true
        },
        editDialogClose() {
            this.$refs.editFormRef.resetFields()
        },
        editParams() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put(`/categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
                if (res.meta.status !== 200) return this.$message.error('请求失败')
                this.$message.success('修改成功')
                this.getParamsData()
                this.dialogVisible_edit = false
            })
        },
        removeParams(attr_id) {
            this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const { data: res } = await this.$http.delete(`/categories/${this.cateId}/attributes/${attr_id}`)
                if (res.meta.status !== 200) return this.$message.error('请求失败')
                this.getParamsData()
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        async handleInputConfirm(row) {
            if(row.inputValue.trim().length === 0){
                row.inputValue=''
                row.inputVisible = false
                return
            }
            //后续处理
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue=''
            row.inputVisible = false
            //发起请求 保存到数据库
           this.saveAttrVals(row)
        },
        async saveAttrVals(row){
            //发起请求 保存到数据库
            const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                attr_name:row.attr_name,
                attr_sel:row.attr_sel,
                attr_vals:row.attr_vals.join(',')
            })
            if (res.meta.status !== 200) return this.$message.error('请求失败')
            this.$message.success('编辑成功')
        },
        showInput(row) {
            row.inputVisible = true
            //让文本框自动获得焦点
            this.$nextTick(_ => {
                this.$refs.saveTagInputRef.$refs.input.focus();
            });
        },
        handleClose(i,row){
            row.attr_vals.splice(i,1)
            this.saveAttrVals(row)
        }
    },
    computed: {
        //如果按钮需要被禁用 返回true 否则返回false
        isBtnDisabled() {
            if (this.selectedCateKeys.length !== 3) {
                return true
            }
            return false
        },
        //当前选中的三级分类的id
        cateId() {
            if (this.selectedCateKeys.length === 3) {
                return this.selectedCateKeys[2]
            }
            return null
        },
        titleText() {
            if (this.activeName === 'many') return '动态参数'
            else {
                return '静态属性'
            }
        }
    }
};
</script>
<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}

.el-tag {
    margin: 10px
}

.input-new-tag {
    width: 120px;
}
</style>