import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Quasar, Dialog, Notify } from "quasar"
import quasarLang from "quasar/lang/ja"

import "quasar/src/css/index.sass"

const app = createApp(App)

app.use(router)
app.use(Quasar, {
    plugins: [Dialog, Notify],
    lang: quasarLang,
  })
  
app.mount('#app')
