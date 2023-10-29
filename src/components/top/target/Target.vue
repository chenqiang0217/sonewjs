<script setup>
import { useRouter } from 'vue-router'


const router = useRouter()
const toPage = (to) => {
    router.push(to)
}
</script>


<template>
    <el-button-group>
        <el-tooltip content="目标类别" placement="bottom">
            <el-button><IconFront iconName="catalog"></IconFront></el-button>
        </el-tooltip>
        <el-tooltip content="节点功能目标" placement="bottom">
            <el-button @click="toPage('nodeShape')"
                ><IconFront iconName="node-shape"></IconFront
            ></el-button>
        </el-tooltip>
        <el-tooltip content="单元几何功能目标" placement="bottom">
            <el-button @click="toPage('elemShape')"
                ><IconFront iconName="element-shape"></IconFront
            ></el-button>
        </el-tooltip>
        <el-tooltip content="单元力功能目标" placement="bottom">
            <el-button @click="toPage('elemForce')"
                ><IconFront iconName="element-force"></IconFront
            ></el-button>
        </el-tooltip>
    </el-button-group>
</template>


<style>
</style>