import Vue from 'vue'
import VueRouter from 'vue-router'

const Composition = () => import('@/views/composition.vue')
const ListView = () => import('@/views/listview.vue')
const Table = () => import('@/views/table.vue')
const Wave = () => import('@/views/wave.vue')
const Battery = () => import('@/views/battery.vue')
const Rendering = () => import('@/views/rendering.vue')
Vue.use(VueRouter)

var routes = [
  {
    path: '/',
    name: 'composition',
    component: Composition
  },
  {
    path: '/listview',
    name: 'listview',
    component: ListView
  },
  {
    path: '/table',
    name: 'table',
    component: Table
  },
  {
    path: '/wave',
    name: 'wave',
    component: Wave
  },
  {
    path: '/battery',
    name: 'battery',
    component: Battery
  },
  {
    path: '/rendering',
    name: 'rendering',
    component: Rendering
  }
]

export default new VueRouter({
  routes: routes
})
