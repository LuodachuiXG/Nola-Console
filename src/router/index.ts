import { createRouter, createWebHashHistory } from 'vue-router';
import { RouterViews } from './RouterViews';
import { StoreEnum } from '../models/enum/StoreEnum.ts';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/404',
      name: '404',
      component: () => import('../views/NotFoundView.vue'),
    },
    {
      path: '/:pathMatch(.*)',
      redirect: '/404',
    },
    {
      path: '/',
      name: RouterViews.LOGIN,
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: `/${RouterViews.MAIN}`,
      name: RouterViews.MAIN,
      component: () => import('../views/MainView.vue'),
    },
  ],
});

/**
 * 导航守卫
 */
router.beforeEach(async (to, _from) => {
  const user = localStorage.getItem(StoreEnum.USER);
  // 已登录就跳转到控制台主页
  if (to.name === RouterViews.LOGIN && user !== null) {
    return { name: RouterViews.MAIN };
  }

  // 未登录的话跳转到登录页面
  if (to.name !== RouterViews.LOGIN && user === null) {
    return { name: RouterViews.LOGIN };
  }
});

export default router;
