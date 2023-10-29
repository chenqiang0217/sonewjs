<script setup>
import Project from './project/Project.vue'
import Model from './model/Model.vue'
import Target from './target/Target.vue'
import Analysis from './analysis/Analysis.vue'
import Select from './select/Select.vue'
import Visibility from './visibility/Visibility.vue'
import View from './view/View.vue'
import Account from './account/Account.vue'
import About from './about/About.vue'
</script>

<template>
    <el-row>
        <el-col>
            <!-- 项目 -->
            <div class="justify-left">
                <Project></Project>
                <el-divider direction="vertical" />
                <!-- 模型 -->
                <Model></Model>
                <el-divider direction="vertical" />
                <!-- 功能目标 -->
                <Target></Target>
                <el-divider direction="vertical" />
                <!-- 分析 -->
                <Analysis></Analysis>
                <el-divider direction="vertical" />
                <!-- 选择 -->
                <Select></Select>
                <el-divider direction="vertical" />
                <!-- 视图 -->
                <View></View>
                <el-divider direction="vertical" />
                <!-- 显示 -->
                <Visibility></Visibility>
            </div>
            <div class="justify-right">
                <!-- 账号 -->
                <Account></Account>
                <!-- about -->
                <About></About>
            </div>
        </el-col>
    </el-row>
</template>

<style >
.el-button {
    margin: 0;
    padding: 0 5px;
    border: 0;
}

.icon {
    width: 18px;
    height: 18px;
    vertical-align: middle;
}

.el-divider {
    margin: 6px;
}

.el-col {
    display: flex;
}

.justify-right {
    margin-left: auto;
    margin-right: 10px;
}


</style>