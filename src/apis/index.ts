import axios, { AxiosRequestHeaders } from 'axios';
import bus from '../utils/EventBus.ts';
import { BusEnum } from '../models/enum/BusEnum.ts';
import { useUserStore } from '../stores/UserStore.ts';
import { errorMsg } from '../utils/Message.ts';
import { watch, ref } from 'vue';

// 标记当前是否正在显示登录过期消息，防止多个 401 请求同时弹出
let show401Message = ref(false);

watch(
  () => show401Message.value,
  (value) => {
    if (value) {
      // 当前已经显示了一个过期弹窗
      // 设置 3 秒后恢复标记位
      setTimeout(() => {
        show401Message.value = false;
      }, 3000);
    }
  }
);

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  withCredentials: true
});

// 请求拦截，在请求发送前加上 Token
service.interceptors.request.use(
  (config) => {
    // 确保 headers 对象已初始化
    config.headers = config.headers || ({} as AxiosRequestHeaders);
    // 检查用户是否已登录
    const userStore = useUserStore();
    if (userStore.isLogin) {
      // 将用户的 Token 设置到请求头中
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    // 必须返回 config，以便请求能发出
    return config;
  },
  (error) => {
    // 处理错误请求
    return Promise.reject(error);
  }
);

/**
 * 响应拦截：后端返回来的结果
 */
service.interceptors.response.use(
  (res) => {
    // 请求成功
    return res.data;
  },
  (err) => {
    if (err.response) {
      // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
      if (err.response.data.code === 401) {
        // Token 过期
        // 用户登出
        useUserStore().logout();
        // 发送登录过期消息
        bus.emit(BusEnum.LOGIN_EXPIRED);
        if (!show401Message.value) {
          // 当前没有 401 弹窗显示时，才弹出新的 401 弹窗
          show401Message.value = true;
          errorMsg('登录过期');
        }
        return Promise.reject('登录过期');
      }
      errorMsg(err.response.data.errMsg);
      return Promise.reject(err.response.data.errMsg);
    }
    // 处理错误响应
    errorMsg(err.response.data.errMsg ?? '未知错误');
    return Promise.reject(err.code ? err.code : err.response.data.errMsg);
  }
);

export default service;
