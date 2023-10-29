<script setup>
import { useStatusStore } from "../../../stores/status"
import { CONSTANT } from "../../../stores/constant"

const status = useStatusStore()
</script>


<template>
    <el-button-group>
        <el-tooltip content="选择" placement="bottom">
            <el-button @click="status.view.mode = CONSTANT.VIEW.SELECTING.S"
                ><IconFront iconName="select-s"></IconFront
            ></el-button>
        </el-tooltip>
        <el-tooltip content="再选择" placement="bottom">
            <el-button @click="status.view.mode = CONSTANT.VIEW.SELECTING.A"
                ><IconFront iconName="select-a"></IconFront
            ></el-button>
        </el-tooltip>
        <el-tooltip content="解除选择" placement="bottom">
            <el-button @click="status.view.mode = CONSTANT.VIEW.SELECTING.U"
                ><IconFront iconName="select-u"></IconFront
            ></el-button>
        </el-tooltip>
        <el-tooltip content="请空选择" placement="bottom">
            <el-button @click="status.view.mode = CONSTANT.VIEW.SELECTING.NONE"
                ><IconFront iconName="clear"></IconFront
            ></el-button>
        </el-tooltip>
    </el-button-group>
</template>


<style>
</style>