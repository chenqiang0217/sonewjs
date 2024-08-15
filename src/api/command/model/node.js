import {Vector3} from '@babylonjs/core'
import {useModelStore} from '../../../stores/model'
import {Command} from '../command'
import {generateUniqueNo} from '../../utils'

class NodeCreateCommand extends Command {
    constructor(node) {
        super()
        this.receiver = node
        this.label = '创建节点'
    }

    execute() {
        this.receiver.create()
    }

    undo() {
        const undo = true
        this.receiver.remove(undo)
    }
}

class NodeMoveCommand extends Command {
    constructor(node) {
        super()
        this.receiver = node
        this.label = '移动节点'
    }

    execute() {
        this.receiver.move()
    }

    undo() {
        const undo = true
        this.receiver.move(undo)
    }
}
class NodeCopyCommand extends Command {
    constructor(node) {
        super()
        this.receiver = node
        this.label = '复制节点'
    }

    execute() {
        this.receiver.copy()
    }

    undo() {
        const undo = true
        this.receiver.remove(undo)
    }
}
class NodeRemoveCommand extends Command {
    constructor(node) {
        super()
        this.receiver = node
        this.label = '删除节点'
    }

    execute() {
        this.receiver.remove()
    }

    undo() {
        const undo = true
        this.receiver.create(undo)
    }
}
class NodeRenameCommand extends Command {
    constructor(node) {
        super()
        this.receiver = node
        this.label = '节点重编号'
    }

    execute() {
        this.receiver.rename()
    }

    undo() {
        const undo = true
        this.receiver.rename(undo)
    }
}

class NodeReceiver {
    constructor(kwargs) {
        this.model = useModelStore()
        this.products = []
        this.kwargs = kwargs
    }
    create(undo = false) {
        if (undo) {
            this.products.forEach(node => {
                this.model.createNode([node.no, ...node.position.asArray()])
            })
            this.clearProducts()
        } else {
            const {no, position, times = 0, gap = Vector3.Zero()} = this.kwargs
            const nodeExist = this.model.node
                .map(node => node.no)
                .filter(item => item >= no)
            let uniqueNo = no
            for (let i = 0; i <= times; i++) {
                uniqueNo = generateUniqueNo(uniqueNo, nodeExist)
                const node = this.model.createNode([
                    uniqueNo,
                    ...position.add(gap.scale(i)).asArray()
                ])
                this.products.push(node)
                uniqueNo += 1
            }
        }
    }
    move(undo = false) {
        const {nos, gap} = this.kwargs
        if (undo) {
            gap.negateInPlace()
        }
        const noSet = new Set(nos)
        this.model.node
            .filter(node => noSet.has(node.no))
            .forEach(node => {
                node.position = node.position.add(gap)
            })
    }
    copy() {
        const {nos, gap, no, times} = this.kwargs
        const noSet = new Set(nos)
        const nodes = this.model.node.filter(node => noSet.has(node.no))
        const noExist = this.model.node
            .map(node => node.no)
            .filter(item => item >= no)
        let uniqueNo = no
        for (let i = 0; i < times; i++) {
            nodes.forEach(node => {
                uniqueNo = generateUniqueNo(uniqueNo, noExist)
                this.products.push(
                    this.model.createNode([
                        uniqueNo,
                        ...node.position.add(gap.scale(i + 1)).asArray()
                    ])
                )
                uniqueNo += 1
            })
        }
    }
    remove(undo = false) {
        if (undo) {
            this.products.forEach(node => this.model.removeNode(node))
            this.clearProducts()
        } else {
            const {nos, onlyIsolated} = this.kwargs
            nos.forEach(no => {
                const node = this.model.node.find(node => node.no === no)
                if (node) {
                    const inElem = this.model.elem.some(
                        elem => elem.iNode === node || elem.jNode === node
                    )
                    const inCnst = this.model.cnst.some(
                        cnst => cnst.node === node
                    )
                    const inNodeShape = this.model.target.nodeShape.some(
                        nodeShape =>
                            nodeShape.nodePrm === node ||
                            nodeShape.nodeSlv === node
                    )
                    if (
                        !onlyIsolated ||
                        (onlyIsolated && !(inElem || inCnst || inNodeShape))
                    ) {
                        this.model.removeNode(node)
                        this.products.push(node)
                    }
                }
            })
        }
    }
    rename(undo = false) {
        if (undo) {
            const node = this.products.shift()
            if (node) {
                const {nos} = this.kwargs
                node.no = nos[0]
            }
            this.clearProducts()
        } else {
            const {nos, noNew} = this.kwargs
            const node = this.model.node.find(node => node.no === nos[0])
            if (node && !this.model.node.some(node => node.no === noNew)) {
                node.no = noNew
                this.products.push(node)
            }
        }
    }
    clearProducts(){
        this.products = []
    }
}

export {
    NodeCreateCommand,
    NodeMoveCommand,
    NodeCopyCommand,
    NodeRemoveCommand,
    NodeRenameCommand,
    NodeReceiver
}
