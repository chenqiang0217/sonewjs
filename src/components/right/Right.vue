<script setup>
import { ref, computed } from 'vue'
import { Target } from '../../api/model/index'
import { useModelStore } from '../../stores/model'
import RightContextMenu from './RightContextMenu.vue'

const equality = [
    {
        no: Target.EQUALITY.EQ,
        label: '等于',
        icon: 'tag',
    },
    {
        no: Target.EQUALITY.GT,
        label: '大于',
        icon: 'tag',
    },
    {
        no: Target.EQUALITY.LT,
        label: '小于',
        icon: 'tag',
    }
]
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
                    label: '自由: ' + model.categorized.node.free.length,
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
                    label: '锁定: ' + model.categorized.node.lock.length,
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
                    label: '自由: ' + model.categorized.elem.free.length,
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
                    label: '锁定: ' + model.categorized.elem.lock.length,
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
            label: '类型: ' + model.categorized.elem.femType.length,
            icon: `femType`,
            children: model.categorized.elem.femType.map((femType) => {
                return {
                    label: femType.label + ': ' + femType.elem.length,
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
            label: '材料: ' + model.categorized.elem.mat.length,
            icon: `mat`,
            children: model.categorized.elem.mat.map(mat => {
                return {
                    label: mat.label + ': ' + mat.elem.length,
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
            label: '截面: ' + model.categorized.elem.sec.length,
            icon: `sec`,
            children: model.categorized.elem.sec.map(sec => {
                return {
                    label: sec.label + ': ' + sec.elem.length,
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
        children: model.categorized.cnst.map((cnst) => {
            return {
                label: '固定节点: ' + cnst.node.length,
                icon: `tag`,
                tag: {
                    view: {
                        mesh: 'node',
                        from: 'cnst',
                        type: cnst.dim,
                    },
                    table: 'cnst',
                },
            }
        }),
    },
    {
        label: '功能目标',
        icon: `node-shape`,
        children: [{
            label: '节点几何',
            icon: `node-shape`,
            children: model.target.group.map(group => ({
                label: group.label,
                icon: `node-shape`,
                children: equality.map(eqlt => {
                    const nodeShape = model.categorized.target.nodeShape.find(nodeShape => nodeShape.group === group.no
                        && nodeShape.equality === eqlt.no)
                    return {
                        nodeSize: nodeShape.node.length,
                        label: eqlt.label + ': ' + nodeShape.node.length,
                        icon: eqlt.icon,
                        tag: {
                            view: {
                                mesh: 'node',
                                from: 'nodeShape',
                                group,
                                type: eqlt.no,
                            },
                            table: 'nodeShape',
                        },
                    }
                }).filter(i => i.nodeSize > 0)
            })),
        },{
            label: '单元几何',
            icon: `elem-shape`,
            children: model.target.group.map(group => ({
                label: group.label,
                icon: `elem-shape`,
                children: equality.map(eqlt => {
                    const elemShape = model.categorized.target.elemShape.find(elemShape => elemShape.group === group.no
                        && elemShape.equality === eqlt.no)
                    return {
                        elemSize: elemShape.elem.length,
                        label: eqlt.label + ': ' + elemShape.elem.length,
                        icon: eqlt.icon,
                        tag: {
                            view: {
                                mesh: 'elem',
                                from: 'elemShape',
                                group,
                                type: eqlt.no,
                            },
                            table: 'elemShape',
                        },
                    }
                }).filter(i => i.elemSize > 0)
            })),
        },{
            label: '单元预应力',
            icon: `elem-force`,
            children: model.target.group.map(group => ({
                label: group.label,
                icon: `elem-force`,
                children: equality.map(eqlt => {
                    const elemForce = model.categorized.target.elemForce.find(elemForce => elemForce.group === group.no
                        && elemForce.equality === eqlt.no)
                    return {
                        elemSize: elemForce.elem.length,
                        label: eqlt.label + ': ' + elemForce.elem.length,
                        icon: eqlt.icon,
                        tag: {
                            view: {
                                mesh: 'elem',
                                from: 'elemForce',
                                group,
                                type: eqlt.no,
                            },
                            table: 'elemForce',
                        },
                    }
                }).filter(i => i.elemSize > 0)
            })),
        }]
    }
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
                <span>
                    <IconFront iconName="tree"></IconFront>
                    <span>树形菜单</span>
                </span>
            </template>
            <el-scrollbar always noresize wrap-class="scroll-wrap" view-class="view-wrap">
                <el-tree :data="modelTreeView" highlight-current @node-contextmenu="onContextmenu">
                    <!-- <template #default="scope">
                        <DocumentAdd v-if="true" class="icon"></DocumentAdd>
                        <span>{{ scope.node.label }}</span>
                    </template> -->
                    <template #default="{ node, data }">
                        <span>
                            <IconFront :iconName="data.icon" color="gray" size="small"></IconFront>
                            <span>{{ node.label }}</span>
                        </span>
                    </template>
                </el-tree>
            </el-scrollbar>
            <RightContextMenu ref="contextMenuRef" :x="options.x" :y="options.y" :tag="options.tag" />
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