/**
 * 路由项接口
 */
interface RouterItem {
  /** 路由名 **/
  name: string;
  /** 路由地址 **/
  path: string;
  /** 路由菜单名 **/
  menuName: string;
  /** 路由显示名 **/
  displayName: string;
}

/**
 * 路由页面类
 */
export class RouterViews {
  static readonly LOGIN: RouterItem = {
    name: 'login',
    path: '/',
    menuName: '',
    displayName: ''
  };
  static readonly MAIN: RouterItem = {
    name: 'main',
    path: '/main',
    menuName: '概述',
    displayName: '博客概述'
  };
  static readonly POST: RouterItem = {
    name: 'post',
    path: '/post',
    menuName: '文章',
    displayName: '文章'
  };
  static readonly TAG: RouterItem = {
    name: 'tag',
    path: '/tag',
    menuName: '标签',
    displayName: '标签'
  };
  static readonly CATEGORY: RouterItem = {
    name: 'category',
    path: '/category',
    menuName: '分类',
    displayName: '分类'
  };
  static readonly COMMENT: RouterItem = {
    name: 'comment',
    path: '/comment',
    menuName: '评论',
    displayName: '评论'
  };
  static readonly ATTACHMENT: RouterItem = {
    name: 'attachment',
    path: '/attachment',
    menuName: '附件',
    displayName: '附件'
  };
  static readonly LINK: RouterItem = {
    name: 'link',
    path: '/link',
    menuName: '链接',
    displayName: '友情链接'
  };
  static readonly MENU: RouterItem = {
    name: 'menu',
    path: '/menu',
    menuName: '菜单',
    displayName: '菜单'
  };
  static readonly SETTING: RouterItem = {
    name: 'setting',
    path: '/setting',
    menuName: '设置',
    displayName: '博客设置'
  };
  static readonly BACKUP: RouterItem = {
    name: 'backup',
    path: '/backup',
    menuName: '备份',
    displayName: '备份'
  };
  static readonly SYSTEM: RouterItem = {
    name: 'system',
    path: '/system',
    menuName: '系统',
    displayName: '系统概述'
  };
}
