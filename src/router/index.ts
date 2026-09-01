import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'configurator',
      component: () => import('../views/ConfiguratorView.vue'),
    },
  ],
})

export default router
