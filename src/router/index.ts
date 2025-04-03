import { createRouter, createWebHistory } from 'vue-router';
import { RouterViews } from './RouterViews';
import { useUserStore } from '../stores/UserStore.ts';

export const router = createRouter({
  history: createWebHistory("/console"),
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
      redirect: '/404'
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
      path: RouterViews.EDITOR.path,
      name: RouterViews.EDITOR.name,
      component: () => import('../views/EditorView.vue'),
      meta: {
        displayName: RouterViews.EDITOR.displayName,
        menuName: RouterViews.EDITOR.menuName
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
      path: RouterViews.DAILY.path,
      name: RouterViews.DAILY.name,
      component: () => import('../views/DiaryView.vue'),
      meta: {
        displayName: RouterViews.DAILY.displayName,
        menuName: RouterViews.DAILY.menuName
      }
    },
    {
      path: RouterViews.ATTACHMENT.path,
      name: RouterViews.ATTACHMENT.name,
      component: () => import('../views/FileView.vue'),
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
    }
  ]
});

/**
 * 该事件可以在用户刷新页面的时候提示页面内容可能不会保存
 * @param event
 */
const handleBeforeunload = (event: BeforeUnloadEvent) =>{
  // 提示用户关闭或刷新浏览器的话当前页内容可能不会保存
  event.preventDefault();
}

/**
 * 导航守卫
 */
router.beforeEach(async (to, from) => {
  const userStore = useUserStore();
  // 已登录就跳转到控制台主页
  if (to.name === RouterViews.LOGIN.name && userStore.isLogin) {
    return { name: RouterViews.MAIN.name };
  }

  // 未登录的话跳转到登录页面
  if (to.name !== RouterViews.LOGIN.name && !userStore.isLogin) {
    return { name: RouterViews.LOGIN.name };
  }

  // 如果是编辑页面，监听 beforeunload 事件
  if (to.name === RouterViews.EDITOR.name) {
    // 监听 beforeunload 事件
    window.addEventListener('beforeunload', handleBeforeunload);
  }

  // 如果离开编辑页面，取消监听 beforeunload 事件
  // 取消监听 beforeunload 事件
  if (from.name === RouterViews.EDITOR.name && to.name !== RouterViews.EDITOR.name) {
    window.removeEventListener('beforeunload', handleBeforeunload);
  }

  document.title = to.meta.displayName?.toString() + ' - Nola';
});

export default router;
