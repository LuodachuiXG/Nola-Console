import { createApp } from 'vue';
import './style.css';
import 'animate.css';
import 'md-editor-v3/lib/style.css';
import router from './router';
import App from './App.vue';
// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';
import { isCurrentSmallWindow } from './utils/MyUtils.ts';
import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persistedstate';
import { useGlobalStore } from './stores/GlobalStore.ts';

const pinia = createPinia();
pinia.use(piniaPersist);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');

/**
 * 全局 Store
 */
const globalStore = useGlobalStore();

/**
 * 监听窗口大小变化
 */
const handleWindowSizeChange = () => {
  globalStore.setIsSmallWindow(isCurrentSmallWindow());
};

// 监听窗口大小变化
window.addEventListener('resize', handleWindowSizeChange);
