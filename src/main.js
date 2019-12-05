import Vue from 'vue'
import App from './App.vue'
import VueCompositionApi from '@vue/composition-api'
import router from './router'
import './components/global.js'
import '@/icons/index'
// import './lib/reset.css'

Vue.use(VueCompositionApi)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
