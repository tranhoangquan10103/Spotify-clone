import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/lara-light-green/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import Tooltip from 'primevue/tooltip';
import { createPinia } from 'pinia'

const app = createApp(App)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    }
  }
})

app.use(PrimeVue)
app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, { queryClient })
app.directive('tooltip', Tooltip);
app.mount('#app')