<script setup>
import { computed, ref, unref, markRaw } from 'vue'
import { ClickOutside as vClickOutside } from 'element-plus'
import { useStatusStore } from '../../stores/status'
import { CONSTANT } from '../../stores/constant'
import { useViewStatusStore } from '../../api/view/index'
import { useCommandStore } from '../../api/command/index'

import {
    projectNew,
    projectOpen,
    projectImport,
    projectSave,
    projectUndo,
    projectRedo
} from './project/project'
import Undo from './project/Undo.vue'
import Redo from './project/Redo.vue'
import Import from './project/Import.vue'
import {
    showDialogNode,
    showDialogElem,
    showDialogConstraint,
    showDialogLoad,
    showDialogCharacter
    // drawFacets,
    // drawPyramids
} from './model/model'
import {
    showDialogTargetGroup,
    showDialogTargetNodeShape,
    showDialogTargetElemShape,
    showDialogTargetElemForce
} from './target/target'
import {
    showDialogSolutionConfig,
    showDialogSolutionRun,
    showSolutionProgress,
    showDialogSolutionResult,
    clearResult
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
    activateSelectedMesh,
    freezeSelectedMesh,
    activateAllMesh,
    freezeAllMesh,
    switchMeshNodeVisibility,
    switchTextBlockNodeVisibility,
    switchTextBlockElemVisibility,
    switchTextBlockTargetVisibility,
    meshViewConfig
} from './visibility/visibility'
import { showDialogAccountLogin, showDialogAccountDetail } from './account/account'
import { about } from './about/about'
import { test } from './test/test'

const status = useStatusStore()
const viewStatus = useViewStatusStore()
const commands = useCommandStore()
const toolBars = computed(() => [
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
            icon: 'suitcase-lg',
            action: () => {},
            clicked: false,
            suffix: Import,
        },
        {
            label: '保存',
            icon: 'floppy',
            action: projectSave,
            clicked: false
        },
        {
            label: '撤销',
            icon: 'undo',
            action: projectUndo,
            disabled: commands.currentStep < 0,
            suffix: Undo,
            clicked: false
        },
        {
            label: '重做',
            icon: 'redo',
            action: projectRedo,
            disabled: commands.currentStep + 1 == commands.commandQueue.length,
            suffix: Redo,
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
        },
        {
            label: '特性',
            icon: 'character',
            action: showDialogCharacter,
            clicked: false
        }
    ],
    [
        {
            label: '目标类别',
            icon: 'catalog',
            action: showDialogTargetGroup,
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
            label: '求解设置',
            icon: 'run-setting',
            action: showDialogSolutionConfig,
            clicked: false
        },
        {
            label: '求解',
            icon: 'run',
            action: showDialogSolutionRun,
            clicked: false,
            disabled: status.task.run !== CONSTANT.TASK.RUN.NONE
        },
        {
            label: '计算进度',
            icon: 'result',
            action: showSolutionProgress,
            clicked: false,
            disabled: status.task.run === CONSTANT.TASK.RUN.NONE
        },
        {
            label: '结果',
            icon: 'deformation-element-density',
            action: showDialogSolutionResult,
            clicked: false,
            disabled: status.task.run === CONSTANT.TASK.RUN.NONE
        },
        status.task.run !== CONSTANT.TASK.RUN.NONE ?
            {
                label: '解锁',
                icon: 'lock-big',
                action: clearResult,
                disabled: status.task.run === CONSTANT.TASK.RUN.PROGRESS
            } :
            {
                label: '锁定',
                icon: 'unlock-big',
                action: () => { },
                disabled: true
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
            icon: 'activate',
            action: activateSelectedMesh,
            clicked: false
        },
        {
            label: '冻结',
            icon: 'freeze',
            action: freezeSelectedMesh,
            clicked: false
        },
        {
            label: '全部激活',
            icon: 'activate-all',
            action: activateAllMesh,
            clicked: false
        },
        {
            label: '全部冻结',
            icon: 'freeze-all',
            action: freezeAllMesh,
            clicked: false
        },
        {
            label: '节点',
            icon: 'node',
            action: switchMeshNodeVisibility,
            clicked: false,
            active: viewStatus.mesh.visible.node
        },
        {
            label: '节点号',
            icon: 'node-no',
            action: switchTextBlockNodeVisibility,
            clicked: false,
            active: viewStatus.textBlock.visible.label.node
        },
        {
            label: '单元号',
            icon: 'element-no',
            action: switchTextBlockElemVisibility,
            clicked: false,
            active: viewStatus.textBlock.visible.label.elem
        },
        {
            label: '目标类别',
            icon: 't-circle',
            action: switchTextBlockTargetVisibility,
            clicked: false,
            active: viewStatus.textBlock.visible.target.all,
            disabled: status.task.run !== CONSTANT.TASK.RUN.NONE
        },
        {
            label: '设置',
            icon: 'setting',
            action: meshViewConfig,
            clicked: false
        }
    ],
    [
        status.user.authenticated ?
            {
                label: '用户详情',
                icon: 'person-check',
                action: showDialogAccountDetail,
                clicked: false,
                show: status.user.authenticated
            } :
            {
                label: '用户登录',
                icon: 'person',
                action: showDialogAccountLogin,
                clicked: false
            },
        {
            label: '关于',
            icon: 'info',
            action: about,
            clicked: false
        },
        {
            label: '测试',
            icon: 'help',
            action: test,
            clicked: false
        }
    ]
])
const suffixRef = ref()
const popoverRef = ref()
const onClickOutside = () => {
    unref(popoverRef).popperRef?.delayHide?.()
}
const onMouseoverSuffix = (e, suffix) => {
    suffixRef.value = e.currentTarget
    status.ui.popover.component = markRaw(suffix)
}

</script>

<template>
    <div style="display: flex; flex-wrap: wrap; flex: 1;">
        <template v-for="(toolBarGroup, i) in toolBars" v-bind:key="i">
            <div v-if="i < toolBars.length - 1" style="display: flex">
                <template v-for="(toolBar, j) in toolBarGroup" v-bind:key="j">
                    <div>
                        <el-tooltip :content="toolBar.label" placement="bottom" effect="light">
                            <el-button @click="() => toolBar.action()" :disabled="toolBar.disabled"
                                :class="toolBar.active ? 'active' : ''">
                                <div class="iconFront">
                                    <IconFront :iconName="toolBar.icon"></IconFront>
                                    <div class="suffix" v-if="toolBar.suffix" v-click-outside="onClickOutside"
                                        @mouseover="e => onMouseoverSuffix(e, toolBar.suffix)" @click.stop="">
                                        <IconFront iconName="caret-down-fill" suffix></IconFront>
                                    </div>
                                </div>
                            </el-button>
                        </el-tooltip>
                    </div>
                </template>
                <el-divider direction="vertical" v-if="i < toolBars.length - 2" />
            </div>
        </template>
    </div>
    <div style="display: flex; justify-content: end">
        <template v-for="(toolBar, j) in toolBars.at(-1)" v-bind:key="j">
            <div>
                <el-tooltip :content="toolBar.label" placement="bottom" effect="light">
                    <el-button @click="toolBar.action">
                        <div class="iconFront">
                            <IconFront :iconName="toolBar.icon"></IconFront>
                        </div>
                    </el-button>
                </el-tooltip>
            </div>
        </template>
    </div>
    <input type="file" id="xlsxFile" @change="projectImport" style="display: none" />
    <el-popover
        popper-style="padding: 0px;border: 1px solid var(--el-color-primary-light-7);box-shadow: var(--el-box-shadow-light); width:auto; min-width:0"
        ref="popoverRef" virtual-triggering :virtual-ref="suffixRef" trigger="click">
        <component :is="status.ui.popover.component" />
    </el-popover>
    <Teleport to="body">
        <component :is="status.ui.dialog.component" v-if="status.ui.dialog.show" />
    </Teleport>
    <component :is="status.ui.modal.component" v-if="status.ui.modal.show" />

</template>

<style lang="scss" scoped>
.el-button {
    height: 28px;
    margin: 2px 1px;
    padding: 0 5px;
    border-radius: var(--el-border-radius-base);

}

.active {
    background-color: var(--el-button-hover-bg-color) !important;
}

.el-divider {
    margin: 6px;
}

.iconFront {
    display: flex;
    align-items: end;
    color: var(--el-color-primary-light-3);

    .suffix:hover {
        color: var(--el-color-primary);
    }
}

.dialog {
    border: 1px solid var(--el-color-primary-light-7);
    box-shadow: var(--el-box-shadow-light);
}
</style>
