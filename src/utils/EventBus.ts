import mitt from 'mitt';

const bus = mitt();

/** 事件名枚举 */
export enum BusEnum {
  /** 登录过期 **/
  LOGIN_EXPIRED = 'login_expired',
  /** 暗色主题 **/
  THEME_DARK = 'theme_dark',
  /** 亮色主题 **/
  THEME_LIGHT = 'theme_light',
  /** 隐藏侧边栏 **/
  HIDDEN_SIDER = 'hidden_sider',
  /** 显示侧边栏 **/
  VISIBLE_SIDER = 'visible_sider',
  /** 刷新文章列表 **/
  REFRESH_POST = 'refresh_post'
}

export default bus;
