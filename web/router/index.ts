import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'
import signStore from '@/stores/sign.ts'

import view_index from '@/views/index.vue'
import view_not_found from '@/views/404.vue'

export const ROUTE_NAME_INDEX = 'Index'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAME_INDEX,
    component: view_index,
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home.vue'),
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/upload.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: view_not_found,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to, from) => {
  document.title = `${to.meta.title || ''} | emos`

  if (!signStore().is_sign && to.name != ROUTE_NAME_INDEX) {
    return {
      name: ROUTE_NAME_INDEX,
      replace: true,
    }
  }
})

export default router

// prettier-ignore
export const KEEP_ALIVE_NAME = [
]

declare module 'vue-router' {
  interface RouteMeta {
    title: string
  }
}
