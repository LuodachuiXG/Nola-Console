import axios, { AxiosRequestHeaders } from 'axios';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import { User } from '../models/User.ts';

// 创建 axios 实例
const service = axios.create({
  baseURL: 'http://127.0.0.1:8098',
  timeout: 5000,
  headers: {
    'Content-type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  withCredentials: true,
});

// 请求拦截，在请求发送前加上 Token
service.interceptors.request.use(
  (config) => {
    // 确保 headers 对象已初始化
    config.headers = config.headers || ({} as AxiosRequestHeaders);
    // 检查用户是否已登录（即 localStorage 中有无 user）
    const _user = localStorage.getItem(StoreEnum.USER);
    // 如果存在 user，则将用户的 Token 设置到请求头中
    if (_user) {
      const user = JSON.parse(_user) as User;
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    // 必须返回 config，以便请求能发出
    return config;
  },
  (error) => {
    // 处理错误请求
    return Promise.reject(error);
  },
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
        // 移除用户配置信息
        localStorage.removeItem(StoreEnum.USER);
        // 弹出登录对话框

      }
      return Promise.reject(err.response.data.errMsg);
    }
    // 处理错误响应
    return Promise.reject(err.code ? err.code : err.response.data.errMsg);
  },
);

export default service;
