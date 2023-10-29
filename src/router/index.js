import { createRouter, createWebHistory} from "vue-router"
import Node from '../components/dialog/Node.vue'
import Elem from '../components/dialog/Elem.vue'
import Fix from '../components/dialog/Fix.vue'
import Load from '../components/dialog/Load.vue'

import NodeShape from '../components/top/target/NodeShape.vue'
import ElemShape from '../components/top/target/ElemShape.vue'
import ElemForce from '../components/top/target/ElemForce.vue'




const routes = [
    {name: 'node', path: '/node', components: {Left: Node}},
    {name: 'elem', path: '/elem', components: {Left: Elem}},
    {name: 'fix', path: '/fix', components: {Left: Fix}},
    {name: 'load', path: '/load', components: {Left: Load}},
    {name: 'nodeShape', path: '/nodeShape', components: {Left: NodeShape}},
    {name: 'elemShape', path: '/elemShape', components: {Left: ElemShape}},
    {name: 'elemForce', path: '/elemForce', components: {Left: ElemForce}},
]
const router = createRouter({
    routes: routes,
    history: createWebHistory(),
})

export default router

