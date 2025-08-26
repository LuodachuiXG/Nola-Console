import { MenuItemTarget } from './enum/MenuItemTarget.ts';

/**
 * 菜单项接口
 */
export interface MenuItem {
  /** 菜单项 ID **/
  menuItemId: number,
  /** 菜单（父菜单） ID **/
  menuId: number,
  /** 菜单名称 **/
  displayName: string,
  /** 链接地址 **/
  href: string,
  /** 打开方式 **/
  target: MenuItemTarget,
  /** 父菜单 ID **/
  parentMenuId: number,
  /** 父菜单项 ID **/
  parentMenuItemId: number | null,
  /** 子菜单项列表 **/
  children: Array<MenuItem>,
  /** 菜单排序索引 **/
  index: number,
  /** 创建时间 **/
  createTime: number,
  /** 最后修改时间 **/
  lastModifyTime: number
}