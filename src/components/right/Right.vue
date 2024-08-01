<script setup>
import { ref, computed } from 'vue'
import { Target } from '../../api/model/index'
import { useModelStore } from '../../stores/model'
import { useViewConfigStore, Color3 } from '../../api/view/index'
import RightContextMenu from './RightContextMenu.vue'
import Color from './Color.vue'

const config = useViewConfigStore()
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
                            label: 'free'
                        },
                        table: 'node'
                    },
                    color: config.mesh.node.color.free
                }, {
                    label: '锁定: ' + model.categorized.node.lock.length,
                    icon: `lock`,
                    tag: {
                        view: {
                            mesh: 'node',
                            from: 'type',
                            label: 'lock',
                        },
                        table: 'node'
                    },
                    color: config.mesh.node.color.lock
                }]
            }, {
                label: '单元',
                icon: `element`,
                children: [{
                    label: '自由: ' + model.categorized.elem.free.length,
                    icon: `unlock`,
                    tag: {
                        view: {
                            mesh: 'elem',
                            from: 'eType',
                            label: 'free'
                        },
                        table: 'elem'
                    },
                    color: model.elemType[0].color
                }, {
                    label: '锁定: ' + model.categorized.elem.lock.length,
                    icon: `lock`,
                    tag: {
                        view: {
                            mesh: 'elem',
                            from: 'eType',
                            label: 'lock'
                        },
                        table: 'elem'
                    },
                    color: model.elemType[1].color
                }]
            }]
    },
    {
        label: '特征值',
        icon: `character`,
        children: [{
            label: '类型: ' + model.elemFemType.length,
            icon: `femType`,
            children: model.elemFemType.map(femType => {
                const length = model.elem.filter(elem => elem.femType === femType).length
                if (length >= 0) {
                    return {
                        label: femType.label + ': ' + length,
                        icon: `tag`,
                        tag: {
                            view: {
                                mesh: 'elem',
                                from: 'femType',
                                label: femType
                            },
                            table: 'elem'
                        },
                        color: femType.color,
                        _: Object.values(femType.color).map(item => item)
                    }
                }
                else{
                    return void 0
                }
            })
        }, {
            label: '材料: ' + model.elemMat.length,
            icon: `mat`,
            children: model.elemMat.map(mat => {
                const length = model.elem.filter(elem => elem.mat === mat).length
                if (length >= 0) {
                    return {
                        label: mat.label + ': ' + length,
                        icon: `tag`,
                        tag: {
                            view: {
                                mesh: 'elem',
                                from: 'mat',
                                label: mat
                            },
                            table: 'elem'
                        },
                        color: mat.color,
                        _: Object.values(mat.color).map(item => item)
                    }
                }
                else{
                    return void 0
                }
            })
        }, {
            label: '截面: ' + model.elemSec.length,
            icon: `sec`,
            children: model.elemSec.map(sec => {
                const length = model.elem.filter(elem => elem.sec === sec).length
                if (length >= 0) {
                    return {
                        label: sec.label + ': ' + length,
                        icon: `tag`,
                        tag: {
                            view: {
                                mesh: 'elem',
                                from: 'sec',
                                label: sec
                            },
                            table: 'elem'
                        },
                        color: sec.color,
                        _: Object.values(sec.color).map(item => item)
                    }
                }
                else{
                    return void 0
                }
            })
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
                        type: cnst.dim
                    },
                    table: 'cnst'
                }
            }
        })
    }, {
        label: '功能目标',
        icon: `node-shape`,
        children: [{
            label: '节点几何',
            icon: `node-shape`,
            children: model.target.group.map(group => ({
                label: group.label,
                icon: `node-shape`,
                children: equality.map(eqlt => {
                    const nodeShape = model.categorized.target.nodeShape.find(nodeShape => nodeShape.group === group
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
                            table: 'nodeShape'
                        }
                    }
                }).filter(i => i.nodeSize > 0)
            })).filter(i => i.children.length > 0)
        }, {
            label: '单元几何',
            icon: `element-shape`,
            children: model.target.group.map(group => ({
                label: group.label,
                icon: `element-shape`,
                children: equality.map(eqlt => {
                    const elemShape = model.categorized.target.elemShape.find(elemShape => elemShape.group === group
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
                                type: eqlt.no
                            },
                            table: 'elemShape'
                        }
                    }
                }).filter(i => i.elemSize > 0)
            })).filter(i => i.children.length > 0)
        }, {
            label: '单元预应力',
            icon: `element-force`,
            children: model.target.group.map(group => ({
                label: group.label,
                icon: `element-force`,
                children: equality.map(eqlt => {
                    const elemForce = model.categorized.target.elemForce.find(elemForce => elemForce.group === group
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
                                type: eqlt.no
                            },
                            table: 'elemForce'
                        }
                    }
                }).filter(i => i.elemSize > 0)
            })).filter(i => i.children.length > 0)
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
    if (object.tag) {
        contextMenuRef.value.show = true
        options.value.x = event.x
        options.value.y = event.y
        options.value.tag = object.tag
    }
}
const colorChange = (data, colorHexString) => {
    if (colorHexString) {
        const color = Color3.FromHexString(colorHexString)
        if (data.color.equals(color)) {
            return
        }
        data.color.r = color.r
        data.color.g = color.g
        data.color.b = color.b
    }
}
</script>

<template>
    <el-tabs type="border-card" class="right-tabs">
        <el-tab-pane>
            <template #label>
                <el-text>
                    <IconFront iconName="tree"></IconFront>
                    树形菜单
                </el-text>
            </template>
            <el-scrollbar>
                <el-tree :data="modelTreeView" highlight-current default-expand-all @node-contextmenu="onContextmenu">
                    <template #default="{ node, data }">
                        <div style="display: flex; width:100%">
                            <div>
                                <el-text>
                                    <IconFront :iconName="data.icon" size="small"></IconFront>{{ node.label }}
                                </el-text>
                            </div>
                            <Color v-if="data.color" :color="data.color.toHexString()"
                                :disabled="data.tag.view.mesh !== 'node' && data.tag.view.from !== config.mesh.elem.color.binding"
                                @change="(color) => colorChange(data, color)"
                                style="margin-left: auto;margin-right: 20px;" />
                        </div>
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
}
</style>