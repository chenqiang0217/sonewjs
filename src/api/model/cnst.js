class Cnst {
    constructor([no, node, dim, cs]) {
        this.no = no
        this.node = node
        this.dim = dim
        this.cs = cs
    }
    toArray() {
        return [this.no, this.node.no, this.dim, this.cs]
    }
}
export { Cnst }
