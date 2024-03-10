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

const app = createApp(App);

app.use(router);
app.mount('#app');
