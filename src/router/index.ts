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
      meta: {
        displayName: '404'
      }
    },
    {
      path: '/:pathMatch(.*)',
      redirect: '/404',
    },
    {
      path: RouterViews.LOGIN.path,
      name: RouterViews.LOGIN.name,
      component: () => import('../views/LoginView.vue'),
      meta: {
        displayName: RouterViews.LOGIN.displayName,
        menuName: RouterViews.LOGIN.menuName
      }
    },
    {
      path: RouterViews.MAIN.path,
      name: RouterViews.MAIN.name,
      component: () => import('../views/MainView.vue'),
      meta: {
        displayName: RouterViews.MAIN.displayName,
        menuName: RouterViews.MAIN.menuName
      }
    },
    {
      path: RouterViews.POST.path,
      name: RouterViews.POST.name,
      component: () => import('../views/PostView.vue'),
      meta: {
        displayName: RouterViews.POST.displayName,
        menuName: RouterViews.POST.menuName
      }
    },
    {
      path: RouterViews.TAG.path,
      name: RouterViews.TAG.name,
      component: () => import('../views/TagView.vue'),
      meta: {
        displayName: RouterViews.TAG.displayName,
        menuName: RouterViews.TAG.menuName
      }
    },
    {
      path: RouterViews.CATEGORY.path,
      name: RouterViews.CATEGORY.name,
      component: () => import('../views/CategoryView.vue'),
      meta: {
        displayName: RouterViews.CATEGORY.displayName,
        menuName: RouterViews.CATEGORY.menuName
      }
    },
    {
      path: RouterViews.COMMENT.path,
      name: RouterViews.COMMENT.name,
      component: () => import('../views/CommentView.vue'),
      meta: {
        displayName: RouterViews.COMMENT.displayName,
        menuName: RouterViews.COMMENT.menuName
      }
    },
    {
      path: RouterViews.ATTACHMENT.path,
      name: RouterViews.ATTACHMENT.name,
      component: () => import('../views/AttachmentView.vue'),
      meta: {
        displayName: RouterViews.ATTACHMENT.displayName,
        menuName: RouterViews.ATTACHMENT.menuName
      }
    },
    {
      path: RouterViews.LINK.path,
      name: RouterViews.LINK.name,
      component: () => import('../views/LinkView.vue'),
      meta: {
        displayName: RouterViews.LINK.displayName,
        menuName: RouterViews.LINK.menuName
      }
    },
    {
      path: RouterViews.MENU.path,
      name: RouterViews.MENU.name,
      component: () => import('../views/MenuView.vue'),
      meta: {
        displayName: RouterViews.MENU.displayName,
        menuName: RouterViews.MENU.menuName
      }
    },
    {
      path: RouterViews.SETTING.path,
      name: RouterViews.SETTING.name,
      component: () => import('../views/SettingView.vue'),
      meta: {
        displayName: RouterViews.SETTING.displayName,
        menuName: RouterViews.SETTING.menuName
      }
    },
    {
      path: RouterViews.BACKUP.path,
      name: RouterViews.BACKUP.name,
      component: () => import('../views/BackupView.vue'),
      meta: {
        displayName: RouterViews.BACKUP.displayName,
        menuName: RouterViews.BACKUP.menuName
      }
    },
    {
      path: RouterViews.SYSTEM.path,
      name: RouterViews.SYSTEM.name,
      component: () => import('../views/SystemView.vue'),
      meta: {
        displayName: RouterViews.SYSTEM.displayName,
        menuName: RouterViews.SYSTEM.menuName
      }
    },
  ],
});

/**
 * 导航守卫
 */
router.beforeEach(async (to, _from) => {
  const user = localStorage.getItem(StoreEnum.USER);
  // 已登录就跳转到控制台主页
  if (to.name === RouterViews.LOGIN.name && user !== null) {
    return { name: RouterViews.MAIN.name };
  }

  // 未登录的话跳转到登录页面
  if (to.name !== RouterViews.LOGIN.name && user === null) {
    return { name: RouterViews.LOGIN.name };
  }

  document.title = to.meta.displayName?.toString() + ' - Nola';
});

export default router;
