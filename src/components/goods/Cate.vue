<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card class="box-card">
            <el-row>
                <el-col :span="24">
                    <el-button type="primary" @click="showAddDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <tree-table class="treeTable" :data="cateList" show-index border :show-row-hover="false" :columns="columns"
                :selection-type="false" :expand-type="false">
                <!-- 是由有效模板 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <!-- 排序模板 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <!-- 操作模板 -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-search" size="mini"
                        @click="showEdit(scope.row.cat_name, scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-search" size="mini" @click="deleteCate(scope.row.cat_id)">删除
                    </el-button>
                </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类对话框 -->
        <el-dialog title="添加分类" :visible.sync="dialogVisible_add" width="50%" @close="addCateDialogClose">
            <!-- 添加分类的表单 -->
            <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="rules">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类" prop="cat_pid">
                    <el-cascader v-model="selectedKeys" :options="cateListForAdd" :props="{
                        expandTrigger: 'hover',
                        value: 'cat_id',
                        label: 'cat_name',
                        children: 'children',
                        checkStrictly: true
                    }" @change="handleChange" clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible_add = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑分类名称对话框 -->
        <el-dialog title="编辑分类" :visible.sync="dialogVisible_edit" width="50%" @close="editDialogClose">
            <el-form ref="editFormRef" :model="editForm" label-width="120px" :rules="rules">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible_edit = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
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
            // 请求参数
            queryInfo: {
                type: 3, //值：1，2，3 分别表示显示一层二层三层分类列表<br />【可选参数】如果不传递，则默认获取所有级别的分类 |
                pagenum: 1,  //【可选参数】如果不传递，则默认获取所有分类
                pagesize: 5  //【可选参数】如果不传递，则默认获取所有分类
            },
            // 商品分类的数据列表 默认为空
            cateList: [],
            cateListForAdd: [],
            // 数据总条数
            total: 0,
            dialogVisible_add: false,
            dialogVisible_edit: false,

            addForm: {
                cat_name: '',
                //分类的父级id
                cat_pid: 0,
                // 分类的等级 默认1级 
                cat_level: 0
            },
            editForm: {
                cat_name: '',
                cat_id: 0,
            },
            //选中的父级分类的id数组
            selectedKeys: [],

            rules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                ]
            },
            //为table指定列的定义
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name',
                },
                {
                    label: '是否有效',
                    type: 'template',
                    template: 'isok',
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'order',
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'opt',
                },
            ]
        };
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('/categories', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            console.log(res)
            this.cateList = res.data.result
            this.total = res.data.total
        },
        showAddDialog() {
            this.getCateListForAdd()
            this.dialogVisible_add = true
        },
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        //添加分类时用到的 获取父类数据
        async getCateListForAdd() {
            const { data: res } = await this.$http.get('/categories', { params: { type: 2 } })
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.cateListForAdd = res.data
        },
        //对话框中 选择项发生变化时的函数
        handleChange() {

            //如果selectedKeys 数组中的length 大于0 证明选中了父级
            if (this.selectedKeys.length > 0) {
                this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                this.addForm.cat_level = this.selectedKeys.length
                return
            } else {
                this.addForm.cat_pid = 0
                this.addForm.cat_level = 0
            }
        },
        addCate() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.post('/categories', this.addForm)
                if (res.meta.status !== 201) {
                    return this.$message.error('添加分类失败')
                }
                this.$message.success('添加成功')
                this.getCateList()
                this.dialogVisible_add = false
            })
        },
        addCateDialogClose() {
            this.$refs.addFormRef.resetFields()
            this.selectedKeys = []
            this.addForm.cat_level = 0
            this.addForm.cat_pid = 0

        },
        deleteCate(id) {
            this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const { data: res } = await this.$http.delete(`/categories/${id}`)
                if (res.meta.status !== 200) return this.$message.error('删除失败')
                this.getCateList()
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
        showEdit(name, id) {
            //this.editCateName =''
            this.editForm.cat_name = name
            this.editForm.cat_id = id
            this.dialogVisible_edit = true
        },
        editDialogClose() {
            this.$refs.editFormRef.resetFields()
            this.editForm.cat_name = ''

        },
        editCate() {
            //console.log(this.editForm.cat_name)
            this.$refs.editFormRef.validate(async valid => {

                if (!valid) return
                const { data: res } = await this.$http.put(`/categories/${this.editForm.cat_id}`, { cat_name: this.editForm.cat_name })

                if (res.meta.status !== 200) return this.$message.error('编辑失败')

                this.$message.success('编辑成功')
                this.getCateList()
                this.dialogVisible_edit = false

            })
        }
    }
};
</script>
<style lang="less" scoped>
.treeTable {
    margin-top: 20px;
}

.el-cascader {
    width: 100%;
}
</style>