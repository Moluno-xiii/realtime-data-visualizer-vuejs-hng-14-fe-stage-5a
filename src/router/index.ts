import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { title: 'TAPE: live markets terminal', layout: 'landing' },
    },
    {
      path: '/dashboard',
      name: 'overview',
      component: () => import('@/views/OverviewView.vue'),
      meta: { title: 'Overview' },
    },
    {
      path: '/markets/:symbol',
      name: 'market',
      component: () => import('@/views/MarketDetailView.vue'),
      meta: { title: 'Market' },
    },
    {
      path: '/activity',
      name: 'activity',
      component: () => import('@/views/ActivityView.vue'),
      meta: { title: 'Activity' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: 'Settings' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Not found', layout: 'landing' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const t = (to.meta?.title as string) || ''
  if (to.meta?.layout === 'landing') {
    document.title = 'TAPE: live markets terminal'
  } else {
    document.title = t ? `TAPE · ${t}` : 'TAPE: live markets terminal'
  }
})

export default router
