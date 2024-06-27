class Group {
    constructor({no, label = '', description = ''}) {
        this.no = no
        this.label = label
        this.description = description
    }
}
class NodeElemGroup extends Group {
    constructor({no, node=[], elem=[], label = '', description = ''}) {
        super({no, label, description})
        this.node = node
        this.elem = elem
    }
}
class LoadGroup extends Group {
    constructor({no, label = '', description = ''}) {
        super({no, label, description})
    }
}
class TargetGroup extends Group {
    constructor({no, label = '', description = ''}) {
        super({no, label, description})
    }
}

export {NodeElemGroup, LoadGroup, TargetGroup}
