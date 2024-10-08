<script setup>
import { ref } from 'vue'
import { useView, VIEWCONSTANT } from '../../api/view/index'
import { useModelStore } from '../../stores/model'
import { useStatusStore } from '../../stores/status'
import { Target } from '../../api/model/index'

const props = defineProps({
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    },
    tag: {
        type: Object,
        required: true,
        default: {
            view: {
                from: '',
                mesh: '',
                label: '',
            },
            table: '',
        },
    },
    minWidth: {
        type: Number,
        required: false,
        default: 250,
    },
    theme: {
        type: String,
        required: false,
        default: 'flat',
    },
})
const show = ref(false)
defineExpose({ show })
const onClick = (action, mode, { view, table }) => {
    const viewStatus = useView().scene.metadata.useStatus()
    let meshList, key
    switch (action) {
        case `select`:
            meshList = filter(view)
            key = view.mesh
            switch (mode) {
                case VIEWCONSTANT.SELECTING.S:
                    viewStatus.mesh.selected[key].clear()
                    meshList.forEach(item =>
                        viewStatus.mesh.selected[key].add(item.no)
                    )
                    break
                case VIEWCONSTANT.SELECTING.A:
                    meshList.forEach(item =>
                        viewStatus.mesh.selected[key].add(item.no)
                    )
                    break
                case VIEWCONSTANT.SELECTING.U:
                    meshList.forEach(item =>
                        viewStatus.mesh.selected[key].delete(item.no)
                    )
                    break
            }
            break
        case `activate`:
            const model = useModelStore()
            meshList = new Set(filter(view).map(item => item.no))
            key = view.mesh
            let meshes = useView()[key == 'node' ? 'points' : 'lines']
            const lockMesh = new Set(model.categorized[key].lock.map(item => item.no))
            meshes = viewStatus.mesh.visible.prepFree ? meshes.prep : [...meshes.rslt, ...meshes.prep
                .filter(mesh => lockMesh.has(mesh.mesh.metadata.no))]
            const meshes2 = meshes.filter(mesh => meshList.has(mesh.mesh.metadata.no))
            switch (mode) {
                case VIEWCONSTANT.SELECTING.S:
                    meshes.forEach(mesh => mesh.hide())
                    meshes2.forEach(mesh => mesh.show())
                    break
                case VIEWCONSTANT.SELECTING.A:
                    meshes2.forEach(mesh => mesh.show())
                    break
                case VIEWCONSTANT.SELECTING.U:
                    meshes2.forEach(mesh => mesh.hide())
                    break
            }
            break
        case `table`:
            const status = useStatusStore()
            status.addMainTab(table)
            break
    }
}

const filter = ({ mesh, from, label = 0, group = 0, type = 0 }) => {
    const model = useModelStore()
    switch (mesh) {
        case 'node':
            switch (from) {
                case 'type': {
                    switch (label) {
                        case 'free':
                            return model.categorized.node.free
                        case 'lock':
                            return model.categorized.node.lock
                    }
                }
                case 'cnst': {
                    return model.categorized.cnst
                        .find(cnst => cnst.dim === type).node
                }
                case 'nodeShape': {
                    return model.categorized.target.nodeShape
                        .find(shape => shape.group === group.no && shape.equality === type)
                        .node
                }
            }
        case 'elem':
            switch (from) {
                case 'eType':
                    switch (label) {
                        case 'free':
                            return model.categorized.elem.free
                        case 'lock':
                            return model.categorized.elem.lock
                    }
                case 'femType':
                    return model.elem.filter(elem => elem[from] === label)
                case 'mat':
                    return model.elem.filter(elem => elem[from] === label)
                case 'sec':
                    return model.elem.filter(elem => elem[from] === label)
                case 'elemShape':
                    return model.categorized.target.elemShape
                        .find(shape => shape.group === group.no && shape.equality === type)
                        .elem
                case 'elemForce':
                    return model.categorized.target.elemForce
                        .find(force => force.group === group.no && force.equality === type)
                        .elem
            }
    }
}

const showTargetTextBlock = ({ from: target, group, type: equalityNo }, s) => {
    const view = useView()
    const control = view.control
    const [equality, _] = Object.entries(Target.EQUALITY).find(([key, value]) => value == equalityNo)
    switch (s) {
        case 's':
            control.hideTextBlock('target', 'all', 'all')
            control.showTextBlock('target', target, equality)
            break
        case 'a':
            control.showTextBlock('target', target, equality)
            break
        case 'u':
            control.hideTextBlock('target', target, equality)
            isVisible = false
            break
    }
}
</script>

<template>
    <ContextMenu v-model:show="show" :options="{ x, y, minWidth, theme }">
        <ContextMenuItem @click="onClick(`select`, VIEWCONSTANT.SELECTING.S, tag)">
            <template #label>
                <el-text>选择</el-text>
            </template>
            <template #icon>
                <el-text>
                    <IconFront iconName="select-s" size="small" class="iconFront" />
                </el-text>
            </template>
        </ContextMenuItem>
        <ContextMenuItem @click="onClick(`select`, VIEWCONSTANT.SELECTING.A, tag)">
            <template #label>
                <el-text>再选择</el-text>
            </template>
            <template #icon>
                <el-text>
                    <IconFront iconName="select-a" size="small" class="iconFront" />
                </el-text>
            </template>
        </ContextMenuItem>
        <ContextMenuItem @click="onClick(`select`, VIEWCONSTANT.SELECTING.U, tag)">
            <template #label>
                <el-text>解除选择</el-text>
            </template>
            <template #icon>
                <el-text>
                    <IconFront iconName="select-u" size="small" class="iconFront" />
                </el-text>
            </template>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem @click="onClick(`activate`, VIEWCONSTANT.SELECTING.S, tag)">
            <template #label>
                <el-text>激活</el-text>
            </template>
            <template #icon>
                <el-text>
                    <IconFront iconName="activate" class="iconFront" />
                </el-text>
            </template>
        </ContextMenuItem>
        <ContextMenuItem @click="onClick(`activate`, VIEWCONSTANT.SELECTING.A, tag)">
            <template #label>
                <el-text>再激活</el-text>
            </template>
            <template #icon>
                <el-text>
                    <IconFront iconName="activate" class="iconFront" />
                </el-text>
            </template>
        </ContextMenuItem>
        <ContextMenuItem @click="onClick(`activate`, VIEWCONSTANT.SELECTING.U, tag)">
            <template #label>
                <el-text>冻结</el-text>
            </template>
            <template #icon>
                <el-text>
                    <IconFront iconName="freeze" class="iconFront" />
                </el-text>
            </template>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <template v-if="Array.from(['nodeShape', 'elemShape', 'elemForce']).includes(tag.view.from)">
            <ContextMenuItem @click="showTargetTextBlock(tag.view, 's')">
                <template #label>
                    <el-text>显示</el-text>
                </template>
                <template #icon>
                    <el-text>
                        <IconFront iconName="active" size="small" class="iconFront" />
                    </el-text>
                </template>
            </ContextMenuItem>
            <ContextMenuItem @click="showTargetTextBlock(tag.view, 'a')">
                <template #label>
                    <el-text>再显示</el-text>
                </template>
                <template #icon>
                    <el-text>
                        <IconFront iconName="active" size="small" class="iconFront" />
                    </el-text>
                </template>
            </ContextMenuItem>
            <ContextMenuItem @click="showTargetTextBlock(tag.view, 'u')">
                <template #label>
                    <el-text>隐藏</el-text>
                </template>
                <template #icon>
                    <el-text>
                        <IconFront iconName="frezone" size="small" class="iconFront" />
                    </el-text>
                </template>
            </ContextMenuItem>
            <ContextMenuSeparator />
        </template>
        <ContextMenuItem @click="onClick(`table`, 0, tag)">
            <template #label>
                <el-text>表格</el-text>
            </template>
            <template #icon>
                <el-text>
                    <IconFront iconName="import" size="small" class="iconFront" />
                </el-text>
            </template>
        </ContextMenuItem>
    </ContextMenu>
</template>

<style scoped>
.iconFront {
    font-size: 14px;
}
</style>
