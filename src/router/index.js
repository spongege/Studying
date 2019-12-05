import Vue from 'vue'
import VueRouter from 'vue-router'

const Composition = () => import('@/views/composition.vue')
const ListView = () => import('@/views/listview.vue')
const Table = () => import('@/views/table.vue')
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
  }
]

export default new VueRouter({
  routes: routes
})
