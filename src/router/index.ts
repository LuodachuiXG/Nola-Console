import {createRouter, createWebHashHistory} from 'vue-router';
import {RouterViews} from './RouterViews';

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/404',
            name: '404',
            component: () => import('../views/NotFoundView.vue')
        },
        {
            path: '/:pathMatch(.*)',
            redirect: '/404'
        },
        {
            path: '/',
            name: RouterViews.LOGIN,
            component: () => import('../views/LoginView.vue')
        },
        {
            path: `/${RouterViews.MAIN}`,
            name: RouterViews.MAIN,
            component: () => import('../views/MainView.vue')
        }
    ]
});

// 导航守卫
// router.beforeEach(async (to, _from) => {
//     return {name: to.name};
// })

export default router