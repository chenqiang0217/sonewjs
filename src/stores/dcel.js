import { Vector3, Plane } from "@babylonjs/core"
class Edge {
    constructor([no, elem, aVertex, bVertex, boundary = false]) {
        this.no = no
        this.elem = elem
        this.aVertex = aVertex
        this.bVertex = bVertex
        this.face = 0
        this.angle = void 0
        this.boundary = boundary
    }
}
class Face {
    constructor({ no, edges, elems, vertexs, boundary = fasle }) {
        this.no = no
        this.edges = edges
        this.elems = elems
        this.vertexs = vertexs
        this.boundary = boundary
    }
    get facets() {
        let minAngle = Math.PI
        let minAngleIndex = 0
        this.edges.forEach((edge, i) => {
            if (edge.angle < minAngle) {
                minAngle = edge.angle
                minAngleIndex = i
            }
        })
        const res = []
        for (let i = 0; i < this.vertexs.length - 2; i++) {
            let aVertex = this.vertexs.at(minAngleIndex)
            let bVertex = this.vertexs.at(minAngleIndex + i + 1)
            let cVertex = this.vertexs.at(minAngleIndex + i + 2)
            if (
                getAngleBetweenVectorsOnPlane(
                    bVertex.position.subtract(aVertex.position),
                    cVertex.position.subtract(aVertex.position),
                ) > 0
            ) {
                res.push({
                    node: [aVertex, bVertex, cVertex],
                    elem: [
                        this.elems.at(minAngleIndex).no,
                        this.elems.at(minAngleIndex + i + 1).no,
                        this.elems.at(minAngleIndex + i + 2).no,
                    ]
                })
            }
        }
        return res
    }
    get center() {
        let center = Vector3.Zero()
        this.vertexs.forEach(vertex => center = center.add(vertex.position))
        return center.scale(1 / this.vertexs.length)
    }
    get normal() {
        const facets = this.facets
        let normal = Vector3.Zero()
        facets.forEach(facet => {
            let [aVertex, bVertex, cVertex] = facet.node.map(node => node.position)
            const plane = Plane.FromPoints(aVertex, bVertex, cVertex)
            plane.normalize()
            normal = normal.add(plane.normal)
        })
        return normal.scale(1 / facets.length)
    }
}

class Dcel {
    constructor(nodes, elems) {
        this.vertexs = nodes
        this.edges = []
        this.faces = []
        let i = 0
        elems.forEach(elem => {
            this.edges.push(new Edge([++i, elem.no, elem.iNode, elem.jNode]))
            this.edges.push(new Edge([++i, elem.no, elem.jNode, elem.iNode]))
        })
        this.generateFaces()
    }
    generateFaces() {
        let i = 0
        this.edges.forEach(edge => {
            if (edge.face == 0) {
                const edges = [edge]
                if (this.edges_next(edges)) {
                    i++
                    const vertexs = []
                    edges.forEach(edge => {
                        vertexs.push(this.vertexs.find(vertex => vertex.no == edge.aVertex))
                        edge.face = i
                    })
                    let aVertex = vertexs.at(-1)
                    let [bVertex, cVertex] = vertexs
                    edges.at(0).angle = getAngleBetweenVectorsOnPlane(
                        bVertex.position.subtract(aVertex.position),
                        cVertex.position.subtract(bVertex.position),
                    )
                    //还可以通过edge仅属于1个face来判断为边界
                    let boundary = false
                    if (edges.filter(edge => edge.angle < 0).length >= edges.length / 2) {
                        boundary = true
                        edges.forEach(edge => {
                            edge.boundary = boundary
                        })
                    }
                    const face = new Face({
                        no: i,
                        edges: edges.map(edge => edge.no),
                        elems: edges.map(edge => edge.elem),
                        vertexs,
                        angles: edges.map(edge => edge.angle),
                        boundary,
                    })
                    this.faces.push(face)
                }
                else {
                    edges.forEach(edge => edge.face == -1)
                }
            }
        })
    }
    edges_next(edges) {
        const next = this.edge_next(edges.at(-1))
        if (next) {
            if (edges.length >= 2 && edges.at(0).no === next.no) {
                return true
            }
            else {
                edges.push(next)
                return this.edges_next(edges)
            }
        }
        else {
            return false
        }
    }
    edge_next(edge) {
        const aVertex = this.vertexs.find(vertex => vertex.no == edge.aVertex)
        const bVertex = this.vertexs.find(vertex => vertex.no == edge.bVertex)
        const vector = bVertex.position.subtract(aVertex.position)
        const nextEdges = this.edges.filter(next =>
            //边相连且不相同且未遍历
            next.aVertex == edge.bVertex && next.elem != edge.elem && next.face == 0
        )
        nextEdges.forEach(next => {
            //两边投影到法向量为（0，0，1）的平面后，取最大夹角对应边。两边叉积与法向量方向相反时夹角为负
            next.angle = getAngleBetweenVectorsOnPlane(vector,
                this.vertexs.find(vertex => vertex.no == next.bVertex).position.subtract(bVertex.position),
            )
        })
        return nextEdges.sort((a, b) => a.angle - b.angle).pop()
    }
}
const getAngleBetweenVectorsOnPlane = (vector1, vector2, planeNormal = new Vector3(0, 0, 1)) => {
    return Vector3.GetAngleBetweenVectorsOnPlane(vector1, vector2, planeNormal)
}

export { Dcel, Face }