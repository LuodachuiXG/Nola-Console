import service from './index.ts';

/**
 * 获取博客信息
 */
export function getBlogInfo() {
  return service({
    url: '/api/config/blog',
    method: 'GET'
  });
}

/**
 * 初始化博客
 * @param title 站点标题
 * @param subtitle 站点副标题
 */
export function initBlogInfo(title: string, subtitle: string) {
  return service({
    url: '/admin/config/blog',
    method: 'POST',
    data: {
      title: title,
      subtitle: subtitle
    }
  });
}

/**
 * 创建博客管理员
 * @param username 用户名
 * @param displayName 显示名称
 * @param email 邮箱
 * @param password 密码
 */
export function createBlogAdmin(
  username: string,
  displayName: string,
  email: string,
  password: string
) {
  return service({
    url: '/admin/config/blog/admin',
    method: 'POST',
    data: {
      username: username,
      displayName: displayName,
      email: email,
      password: password
    }
  });
}
