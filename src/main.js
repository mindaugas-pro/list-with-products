import { createApp } from 'vue'
import App from './App.vue'
import '../node_modules/bulma/css/bulma.css' // <-- import Bulma CSS
import router from './router' // <-- import router
import store from './store' // <-- import store

createApp(App).use(router).use(store).mount('#app') // <-- use router