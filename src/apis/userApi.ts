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

/**
 * 获取当前登录的管理员信息
 */
export function getUserInfo() {
  return service({
    url: '/admin/user',
    method: 'GET'
  });
}

/**
 * 获取当前登录的管理员信息
 * @param username 用户名
 * @param email 邮箱
 * @param displayName 昵称
 * @param description 描述
 * @param avatar 头像
 */
export function updateUserInfo(
  username: string,
  email: string,
  displayName: string,
  description: string | null,
  avatar: string | null
) {
  return service({
    url: '/admin/user',
    method: 'PUT',
    data: {
      username: username,
      email: email,
      displayName: displayName,
      description: description,
      avatar: avatar
    }
  });
}


/**
 * 获取当前登录的管理员信息
 * @param password 密码
 */
export function updateUserPassword(
  password: string
) {
  return service({
    url: '/admin/user/password',
    method: 'PUT',
    data: {
      password: password
    }
  });
}