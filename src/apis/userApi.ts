import service from './index.ts';

/**
 * 管理员登录
 */
export function login(username: string, password: string) {
  return service({
    url: '/admin/user/login',
    method: 'POST',
    data: {
      username: username,
      password: password
    }
  });
}
