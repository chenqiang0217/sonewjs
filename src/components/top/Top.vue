<script setup>
import { ref } from 'vue'
import { useStatusStore } from '../../stores/status'
import {
    projectNew,
    projectOpen,
    projectImportCilck,
    projectImport,
    projectSave
} from './project/project'
import {
    showDialogNode,
    showDialogElem,
    showDialogConstraint,
    showDialogLoad,
    drawFacets,
    drawPyramids
} from './model/model'
import {
    showDialogTargetCatalog,
    showDialogTargetNodeShape,
    showDialogTargetElemShape,
    showDialogTargetElemForce
} from './target/target'
import {
    showDialogSolutionconfig,
    solutionRun,
    showSolutionProgress,
    showDialogSolutionResult
} from './solution/solution'
import {
    meshSelect,
    meshSelectAddition,
    meshUnselect,
    meshClearselect
} from './select/select'
import {
    viewMove,
    viewRotate,
    viewIsometric,
    viewTop,
    viewFront,
    viewRight
} from './view/view'
import {
    activeMesh,
    freezeMesh,
    switchMeshNodeVisibility,
    switchLabelNodelVisibility,
    switchLabelElemVisibility,
    meshViewConfig
} from './visibility/visibility'
import Account from './account/Account.vue'
import About from './about/About.vue'
import Dialog from './Dialog.vue'



const status = useStatusStore()
const toolBars = ref([
    [
        {
            label: '新建',
            icon: 'new',
            action: projectNew,
            clicked: false
        },
        {
            label: '打开',
            icon: 'open',
            action: projectOpen,
            clicked: false
        },
        {
            label: '导入',
            icon: 'import',
            action: projectImportCilck,
            clicked: false
        },
        {
            label: '保存',
            icon: 'save',
            action: projectSave,
            clicked: false
        }
    ],
    [
        {
            label: '节点',
            icon: 'node',
            action: showDialogNode,
            clicked: false
        },
        {
            label: '线单元',
            icon: 'element',
            action: showDialogElem,
            clicked: false
        },
        // {
        //     label: '线单元-角锥',
        //     icon: 'element',
        //     action: drawPyramids,
        //     clicked: false
        // },
        // {
        //     label: '膜单元',
        //     icon: 'top-view',
        //     action: drawFacets,
        //     clicked: false
        // },
        {
            label: '支座',
            icon: 'constraint',
            action: showDialogConstraint,
            clicked: false
        },
        {
            label: '荷载',
            icon: 'load',
            action: showDialogLoad,
            clicked: false
        }
    ],
    [
        {
            label: '目标类别',
            icon: 'catalog',
            action: showDialogTargetCatalog,
            clicked: false
        },
        {
            label: '节点功能目标',
            icon: 'node-shape',
            action: showDialogTargetNodeShape,
            clicked: false
        },
        {
            label: '单元几何功能目标',
            icon: 'element-shape',
            action: showDialogTargetElemShape,
            clicked: false
        },
        {
            label: '单元力功能目标',
            icon: 'element-force',
            action: showDialogTargetElemForce,
            clicked: false
        }
    ],
    [
        {
            label: '求解设置',
            icon: 'run-setting',
            action: showDialogSolutionconfig,
            clicked: false
        },
        {
            label: '求解',
            icon: 'run',
            action: solutionRun,
            clicked: false
        },
        {
            label: '计算进度',
            icon: 'result',
            action: showSolutionProgress,
            clicked: false
        },
        {
            label: '结果',
            icon: 'deformation-element-density',
            action: showDialogSolutionResult,
            clicked: false
        }
    ],
    [
        {
            label: '选择',
            icon: 'select-s',
            action: meshSelect,
            clicked: false
        },
        {
            label: '再选择',
            icon: 'select-a',
            action: meshSelectAddition,
            clicked: false
        },
        {
            label: '解除选择',
            icon: 'select-u',
            action: meshUnselect,
            clicked: false
        },
        {
            label: '请空选择',
            icon: 'clear',
            action: meshClearselect,
            clicked: false
        }
    ],
    [
        {
            label: '移动',
            icon: 'move',
            action: viewMove,
            clicked: false
        },
        {
            label: '旋转',
            icon: 'rotate',
            action: viewRotate,
            clicked: false
        },
        {
            label: '标准视图',
            icon: 'isometric-view',
            action: viewIsometric,
            clicked: false
        },
        {
            label: '顶视图',
            icon: 'top-view',
            action: viewTop,
            clicked: false
        },
        {
            label: '正视图',
            icon: 'front-view',
            action: viewFront,
            clicked: false
        },
        {
            label: '右视图',
            icon: 'right-view',
            action: viewRight,
            clicked: false
        }
    ],
    [
        {
            label: '激活',
            icon: 'active',
            action: activeMesh,
            clicked: false
        },
        {
            label: '冻结',
            icon: 'frezone',
            action: freezeMesh,
            clicked: false
        },
        {
            label: '节点',
            icon: 'node',
            action: switchMeshNodeVisibility,
            clicked: false
        },
        {
            label: '节点号',
            icon: 'node-no',
            action: switchLabelNodelVisibility,
            clicked: false
        },
        {
            label: '单元号',
            icon: 'element-no',
            action: switchLabelElemVisibility,
            clicked: false
        },
        {
            label: '设置',
            icon: 'setting',
            action: meshViewConfig,
            clicked: false
        }
    ],
    [
        {
            label: '账号',
            icon: 'account',
            action: freezeMesh,
            clicked: false
        },
        {
            label: '关于',
            icon: 'about',
            action: activeMesh,
            clicked: false
        }
    ]
])
</script>

<template>
    <template
        v-for="(toolBarGroup, i) in toolBars"
        v-bind:key="i"
    >
        <template
            v-for="(toolBar, j) in toolBarGroup"
            v-bind:key="j"
        >
            <div
                :class="
                    i === toolBars.length - 1 && j === 0 ? 'justify-right' :  i === toolBars.length - 1 && j === toolBarGroup.length-1 ? 'justify-end' : ''
                "
            >
                <el-tooltip
                    :content="toolBar.label"
                    placement="bottom"
                    effect="light"
                >
                    <el-button @click="toolBar.action">
                        <IconFront :iconName="toolBar.icon"></IconFront>
                    </el-button>
                </el-tooltip>
            </div>
        </template>
        <el-divider direction="vertical" v-if="i < toolBars.length - 2"/>
    </template>
    <input
        type="file"
        id="xlsxFile"
        @change="projectImport"
        style="display: none"
    />
    <Dialog
        :title="status.ui.dialog.title"
        :width="status.ui.dialog.width"
        :show="status.ui.dialog.show"
    >
        <component :is="status.ui.dialog.component.is" />
    </Dialog>
</template>

<style scoped>
.el-button {
    margin: 0;
    padding: 0 5px;
    border: 0;
}
.el-divider {
    margin: 6px;
}
.justify-right {
    margin-left: auto;
}
.justify-end {
    margin-right: 10px;
}
</style>
