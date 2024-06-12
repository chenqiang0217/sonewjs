<script setup>
import Top from './components/top/Top.vue'
import Main from './components/main/Main.vue'
import Right from './components/right/Right.vue'
import Bottom from './components/bottom/Bottom.vue'
</script>

<template>
    <div class="container">
        <div class="header">
            <Top />
        </div>
        <div class="main">
            <Main />
        </div>
        <div class="bottom">
            <Bottom />
        </div>
        <div class="right">
            <Right />
        </div>
    </div>
</template>

<style scoped>
* {
    margin: 0px;
    padding: 0px;
}

.container {
    display: grid;
    grid-template-columns: 1fr 250px;
    grid-template-rows: auto 1fr 200px;
    grid-template-areas:
        'header header'
        'main   right'
        'bottom right';
    height: 100%;
}

.header {
    grid-area: header;
    display: flex;
    flex-wrap: wrap;
}

.main {
    grid-area: main;
}

.bottom {
    grid-area: bottom;
}

.right {
    grid-area: right;
}

/* 结构显示中颜色拾取器的宽度 */
.el-color-picker__trigger {
    width: 120px;
}



</style>
