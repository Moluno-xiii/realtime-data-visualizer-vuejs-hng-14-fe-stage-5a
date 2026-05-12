import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { vReveal } from './directives/reveal'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('reveal', vReveal)

router.isReady().then(() => {
  app.mount('#app')
  const prefetch = () => {
    import('./views/OverviewView.vue')
    import('./views/MarketDetailView.vue')
    import('./views/ActivityView.vue')
    import('./views/SettingsView.vue')
    import('./views/LandingView.vue')
  }
  const idle =
    (window as Window & { requestIdleCallback?: (cb: () => void) => void })
      .requestIdleCallback
  if (typeof idle === 'function') idle(prefetch)
  else setTimeout(prefetch, 800)
})
