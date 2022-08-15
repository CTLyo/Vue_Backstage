<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
            </el-alert>
            <!-- 步骤条 -->
            <!-- activeIndex - 0 将字符转换为 数字 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- tab栏 -->
            <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave"
                    @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="{
                                expandTrigger: 'hover',
                                label: 'cat_name',
                                value: 'cat_id',
                                children: 'children'
                            }" @change="handleChange"></el-cascader>
                        </el-form-item>

                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <!-- 复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
                            list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑框 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <!-- 添加商品按钮 -->
                         <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

<!-- 图片预览对话框 -->
        <el-dialog
  title="提示"
  :visible.sync="dialogVisible_preView"
  width="50%">
  <img :src="previewPath" alt="" class="preViewImg">
</el-dialog>
    </div>
</template>

<script>

// 导入lodash依赖
import _ from 'lodash'

export default {
    data() {
        return {
            activeIndex: '0',
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                goods_cat: [],
                //上传图片的数组
                pics:[],
                // 商品详情描述
                goods_introduce:'',
                attrs:[]
            },
            manyTableData: [],
            onlyTableData: [],
            cateList: [],
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            //图片上传组件的请求头对象
            headerObj:{
                Authorization:window.sessionStorage.getItem('token')
            },
            previewPath:'',
            dialogVisible_preView:false,
            rules: {
                goods_name: [
                    { required: true, message: '请输入商品名称', trigger: 'blur' },
                ],
                goods_price: [
                    { required: true, message: '请输入商品价格', trigger: 'blur' },
                ],
                goods_weight: [
                    { required: true, message: '请输入商品重量', trigger: 'blur' },
                ],
                goods_number: [
                    { required: true, message: '请输入商品数量', trigger: 'blur' },
                ],
                goods_cat: [
                    { required: true, message: '请选中商品分类', trigger: 'blur' },
                ]
            }
        };
    },
    created() {
        this.getCateList()
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get(`/categories`)
            //console.log(res)
            if (res.meta.status !== 200) return this.$message.error('请求失败')

            this.cateList = res.data
        },
        //级联选择器改变时函数
        handleChange() {
            //console.log(this.addForm.goods_cat)
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = []
            }
        },
        beforeTabLeave(activeName, oldActiveName) {
            //console.log(oldActiveName+'---->'+activeName)
            if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请先选中商品分类')
                return false
            }
        },
        async tabClicked() {
            //console.log(this.activeIndex)
            if (this.activeIndex === '1') {
                //console.log('动态')
                const { data: res } = await this.$http.get(`/categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
                if (res.meta.status !== 200) return this.$message.error('请求失败')
                //console.log(res.data)
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
                })
                this.manyTableData = res.data
                //console.log(this.manyTableData)
            }
            else if (this.activeIndex === '2') {
                const { data: res } = await this.$http.get(`/categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
                if (res.meta.status !== 200) return this.$message.error('请求失败')
                this.onlyTableData = res.data
            }
        },
        //图片预览事件
        handlePreview(file) {
            this.previewPath = file.response.data.url
            this.dialogVisible_preView = true
        },
        // 移除图片事件
        handleRemove(file) {
            //console.log(file)
            //1. 获取要删除的图片临时路径
            const filePath = file.response.data.tmp_path
            //2. 从pics 数组中找到这个图片的索引值
            const i = this.addForm.pics.findIndex(x=>x.pic === filePath)
            // 3.调用数组的 splice 方法把图片信息对象从pics数组中删除
            this.addForm.pics.splice(i,1)
            //console.log(this.addForm.pics)
        },
        //图片上传成功后事件
        handleSuccess(response){
            // console.log(response)
            //拼接得到一个图片信息对象
            const picInfo = {pic:response.data.tmp_path}
            //将图片信息对象push到 pics 数组
            this.addForm.pics.push(picInfo)
           // console.log(this.addForm)
        },
        add(){
            //console.log(this.addForm)
            this.$refs.addFormRef.validate(async valid => {
                if(!valid) return this.$message.error('请填写必要的商品信息')
                // 将goods_cat改造成字符串 
                // 这样会报错，此时需要安装 lodash依赖
                const form = _.cloneDeep(this.addForm)
                form.goods_cat = form.goods_cat.join(',')
                // console.log(form)
                // 处理动态参数
                this.manyTableData.forEach(item=>{
                    const newInfo = {attr_id:item.attr_id,attr_vals:item.attr_vals.join(',')}
                    this.addForm.attrs.push(newInfo)
                })
                // 处理静态属性
                this.onlyTableData.forEach(item => {
                     const newInfo = {attr_id:item.attr_id,attr_vals:item.attr_vals}
                    this.addForm.attrs.push(newInfo)
                })

                form.attrs = this.addForm.attrs
                //console.log(form)
                // 发起请求添加商品 商品名称必须唯一
                console.log(form.goods_cat)
                const{data:res} = await this.$http.post(`/goods`,form)
                console.log(res)
                if (res.meta.status !== 201) return this.$message.error('添加商品失败')
                this.$message.success('添加成功')
                this.$router.push(`/goods`)
            })
        }
        
    },
    computed: {
        cateId() {
            if (this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
};
</script>
<style lang="less" scoped>
.el-steps {
    margin: 15px 0;
}

/deep/.el-step__title {
    font-size: 12px;
}

.el-checkbox {
    margin: 0 10px 0 0 !important
}
.preViewImg{
    width: 100%;
}
.addBtn{
    margin-top: 15px;
}
</style>