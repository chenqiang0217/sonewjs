<script setup>
import { useStatusStore } from '../../../stores/status'

const status = useStatusStore()
</script>


<template>
    <el-button-group>
        <el-tooltip content="移动" placement="bottom">
            <el-button>
                <IconFront iconName="move"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="旋转" placement="bottom">
            <el-button>
                <IconFront iconName="rotate"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="标准视图" placement="bottom">
            <el-button>
                <IconFront iconName="isometric-view"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="顶视图" placement="bottom">
            <el-button>
                <IconFront iconName="top-view"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="正视图" placement="bottom">
            <el-button>
                <IconFront iconName="front-view"></IconFront>
            </el-button>
        </el-tooltip>
        <el-tooltip content="右视图" placement="bottom">
            <el-button>
                <IconFront iconName="right-view"></IconFront>
            </el-button>
        </el-tooltip>
    </el-button-group>
</template>


<style></style>