<script setup>
import { useRouter } from 'vue-router'


const router = useRouter()
const toPage = (to) => {
    router.push(to)
}
</script>


<template>
    <el-button-group>
        <el-tooltip content="节点" placement="bottom">
            <el-button @click="toPage('node')">
                <IconFront iconName="node"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="单元" placement="bottom">
            <el-button @click="toPage('elem')">
                <IconFront iconName="element"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="支座" placement="bottom">
            <el-button @click="toPage('fix')">
                <IconFront iconName="constraint"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="荷载" placement="bottom">
            <el-button @click="toPage('load')">
                <IconFront iconName="load"></IconFront>
            </el-button>
        </el-tooltip>
</el-button-group></template>


<style></style>