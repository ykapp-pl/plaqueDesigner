import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/project/:id',
      name: 'project',
      component: () => import('../views/ProjectView.vue'),
    },
    {
      path: '/:pathMatch(configurator)?',
      name: 'configurator',
      component: () => import('../views/ConfiguratorView.vue'),
    },
  ],
})

export default router
