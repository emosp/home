import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import router from '@/router'
import App from '@/App.vue'

const app = createApp(App)
import './style.css'

const pinia = createPinia()
pinia.use(
  createPersistedState({
    key: (id) => `store_${id}`,
  }),
)
app.use(pinia)

app.use(router)

app.mount('#app')
