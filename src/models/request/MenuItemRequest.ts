import { MenuItemTarget } from '../enum/MenuItemTarget.ts';

/**
 * 菜单项请求接口
 */
export interface MenuItemRequest {
  /** 菜单项 ID **/
  menuItemId?: number;
  /** 菜单名称 **/
  displayName: string;
  /** 链接地址 **/
  href: string;
  /** 菜单打开方式 **/
  target: MenuItemTarget | null;
  /** 父菜单 ID **/
  parentMenuId: number;
  /** 父菜单项 ID */
  parentMenuItemId: number | null;
  /** 菜单排序索引 **/
  index: number | null;
}
