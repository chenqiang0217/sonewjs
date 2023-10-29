<script setup>
import { ref, computed } from 'vue'
import { useModelStore } from '../../stores/model'
import RightContextMenu from './RightContextMenu.vue'

const model = useModelStore()
const modelTreeView = computed(() => [
    {
        label: '结构',
        icon: `database`,
        children: [
            {
                label: '节点',
                icon: `node`,
                children: [{
                    label: '自由: ' + model.summarized.node[1].size,
                    icon: `unlock`,
                    tag: {
                        view: {
                            mesh: 'node',
                            from: 'type',
                            label: 'free',
                        },
                        table: 'node',
                    },
                }, {
                    label: '锁定: ' + model.summarized.node[0].size,
                    icon: `lock`,
                    tag: {
                        view: {
                            mesh: 'node',
                            from: 'type',
                            label: 'lock',
                        },
                        table: 'node',
                    },
                },],
            }, {
                label: '单元',
                icon: `element`,
                children: [{
                    label: '自由: ' + model.summarized.elem.type[1].size,
                    icon: `unlock`,
                    tag: {
                        view: {
                            mesh: 'elem',
                            from: 'type',
                            label: 'free',
                        },
                        table: 'elem',
                    },
                }, {
                    label: '锁定: ' + model.summarized.elem.type[0].size,
                    icon: `lock`,
                    tag: {
                        view: {
                            mesh: 'elem',
                            from: 'type',
                            label: 'lock',
                        },
                        table: 'elem',
                    },
                },],
            }]
    },
    {
        label: '特征值',
        icon: `character`,
        children: [{
            label: '类型: ' + model.summarized.elem.femType.length,
            icon: `femType`,
            children: model.summarized.elem.femType.map((femType) => {
                return {
                    label: femType.label + ': ' + femType.size,
                    icon: `tag`,
                    tag: {
                        view: {
                            mesh: 'elem',
                            from: 'femType',
                            label: femType.label,
                        },
                        table: 'elem',
                    },
                }
            }),
        }, {
            label: '材料: ' + model.summarized.elem.mat.length,
            icon: `mat`,
            children: model.summarized.elem.mat.map((mat, i) => {
                return {
                    label: mat.label + ': ' + mat.size,
                    icon: `tag`,
                    tag: {
                        view: {
                            mesh: 'elem',
                            from: 'mat',
                            label: mat.label,
                        },
                        table: 'elem',
                    },
                }
            }),
        }, {
            label: '截面: ' + model.summarized.elem.sec.length,
            icon: `sec`,
            children: model.summarized.elem.sec.map((sec, i) => {
                return {
                    label: sec.label + ': ' + sec.size,
                    icon: `tag`,
                    tag: {
                        view: {
                            mesh: 'elem',
                            from: 'sec',
                            label: sec.label,
                        },
                        table: 'elem',
                    },
                }
            }),
        }]
    }, {
        label: '支座',
        icon: `constraint`,
        children: model.summarized.cnst.map((cnst) => {
            return {
                label: '固定节点: ' + cnst.size,
                icon: `tag`,
                tag: {
                    view: {
                        mesh: 'node',
                        from: 'cnst',
                        type: cnst.type,
                    },
                    table: 'cnst',
                },
            }
        }),
    }, {
        label: '节点几何功能目标',
        icon: `node-shape`,
        children: model.summarized.nodeShape.map((group) => {
            return {
                label: group.label + ': ' + group.type.length,
                icon: `node-shape`,
                children: group.type.map((type) => {
                    return {
                        label: type.label + ': ' + type.size,
                        icon: `tag`,
                        tag: {
                            view: {
                                mesh: 'node',
                                from: 'nodeShape',
                                group: group.no,
                                type: type.no,
                            },
                            table: 'nodeShape',
                        },
                    }
                })
            }
        }),
    },{
        label: '单元几何功能目标',
        icon: `element-shape`,
        children: model.summarized.elemShape.map((group) => {
            return {
                label: group.label + ': ' + group.type.length,
                icon: `element-shape`,
                children: group.type.map((type) => {
                    return {
                        label: type.label + ': ' + type.size,
                        icon: `tag`,
                        tag: {
                            view: {
                                mesh: 'elem',
                                from: 'elemShape',
                                group: group.no,
                                type: type.no,
                            },
                            table: 'elemShape',
                        },
                    }
                })
            }
        }),
    },{
        label: '单元力功能目标',
        icon: `element-force`,
        children: model.summarized.elemForce.map((group) => {
            return {
                label: group.label + ': ' + group.type.length,
                icon: `element-force`,
                children: group.type.map((type) => {
                    return {
                        label: type.label + ': ' + type.size,
                        icon: `tag`,
                        tag: {
                            view: {
                                mesh: 'elem',
                                from: 'elemForce',
                                group: group.no,
                                type: type.no,
                            },
                            table: 'elemForce',
                        },
                    }
                })
            }
        }),
    },
    
])
const contextMenuRef = ref()
const options = ref({
    x: 0,
    y: 0,
    tag: {
        view: {
            from: '',
            mesh: '',
            from: '',
            label: '',
        },
        table: '',
    },
})

const onContextmenu = (event, object, node, element) => {
    if (node.isLeaf) {
        contextMenuRef.value.show = true
        options.value.x = event.x
        options.value.y = event.y
        options.value.tag = object.tag
    }
}
</script>

<template>
    <el-tabs type="border-card" class="right-tabs">
        <el-tab-pane>
            <template #label>
                <span >
                    <IconFront iconName="tree" ></IconFront>
                    <span>树形菜单</span>
                </span>
            </template>
            <el-scrollbar
                always
                noresize
                wrap-class="scroll-wrap"
                view-class="view-wrap"
            >
                <el-tree
                    :data="modelTreeView"
                    highlight-current
                    @node-contextmenu="onContextmenu"
                >
                    <!-- <template #default="scope">
                        <DocumentAdd v-if="true" class="icon"></DocumentAdd>
                        <span>{{ scope.node.label }}</span>
                    </template> -->
                    <template #default="{ node, data }">
                        <span>
                            <IconFront
                                :iconName="data.icon"
                                color="gray"
                                size="small"
                            ></IconFront>
                            <span>{{ node.label }}</span>
                        </span>
                    </template>
                </el-tree>
            </el-scrollbar>
            <RightContextMenu
                ref="contextMenuRef"
                :x="options.x"
                :y="options.y"
                :tag="options.tag"
            />
        </el-tab-pane>
    </el-tabs>
</template>

<style>
.right-tabs {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
}

.el-tab-pane {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
}

.align-items-end {
    max-height: 100%;
    position: absolute;
    bottom: 0;
}

.scroll-wrap {
    height: 100%;
}

.view-wrap {
    height: 100%;
    position: relative;
}
</style>