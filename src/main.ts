import { createApp, reactive } from 'vue';
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

/**
 * 全局响应变量
 */
const globalVars: GlobalVars = reactive({
  isSmallWindow: false
});

/**
 * 监听窗口大小变化
 */
const handleWindowSizeChange = () => {
  globalVars.isSmallWindow = isCurrentSmallWindow();
};

// 监听窗口大小变化
window.addEventListener('resize', handleWindowSizeChange);
// 首次加载时触发一次
handleWindowSizeChange();

const app = createApp(App);
app.provide('globalVars', globalVars);
app.use(router);
app.mount('#app');
