import service from './index.ts';
import { MenuItemRequest } from '../models/request/MenuItemRequest.ts';

/**
 * 添加菜单
 * @param displayName 菜单名称
 * @param isMain 是否为主菜单
 */
export function addMenu(displayName: string, isMain: boolean) {
  return service({
    url: '/admin/menu',
    method: 'POST',
    data: {
      displayName: displayName,
      isMain: isMain
    }
  });
}

/**
 * 删除菜单
 * @param menuIds 菜单 ID 数组
 */
export function delMenu(menuIds: Array<number>) {
  return service({
    url: '/admin/menu',
    method: 'DELETE',
    data: menuIds
  });
}

/**
 * 修改菜单
 * @param menuId 菜单 ID
 * @param displayName 菜单名称
 * @param isMain 是否为主菜单
 */
export function updateMenu(
  menuId: number,
  displayName: string,
  isMain: boolean
) {
  return service({
    url: '/admin/menu',
    method: 'PUT',
    data: {
      menuId: menuId,
      displayName: displayName,
      isMain: isMain
    }
  });
}

/**
 * 获取菜单
 */
export function getMenus(page: number = 0, size: number = 0) {
  return service({
    url: `/admin/menu?page=${page}&size=${size}`,
    method: 'GET'
  });
}

/**
 * 添加菜单项
 * @param menuItemRequest 菜单项请求
 */
export function addMenuItem(menuItemRequest: MenuItemRequest) {
  return service({
    url: `/admin/menu/item`,
    method: 'POST',
    data: {
      displayName: menuItemRequest.displayName,
      href: menuItemRequest.href,
      target: menuItemRequest.target,
      parentMenuId: menuItemRequest.parentMenuId,
      parentMenuItemId: menuItemRequest.parentMenuItemId,
      index: menuItemRequest.index
    }
  });
}

/**
 * 删除菜单
 * @param menuItemIds 菜单项 ID 数组
 */
export function delMenuItem(menuItemIds: Array<number>) {
  return service({
    url: '/admin/menu/item',
    method: 'DELETE',
    data: menuItemIds
  });
}

/**
 * 修改菜单项
 */
export function updateMenuItem(menuItemRequest: MenuItemRequest) {
  return service({
    url: `/admin/menu/item`,
    method: 'PUT',
    data: {
      menuItemId: menuItemRequest.menuItemId,
      displayName: menuItemRequest.displayName,
      href: menuItemRequest.href,
      target: menuItemRequest.target,
      parentMenuId: menuItemRequest.parentMenuId,
      parentMenuItemId: menuItemRequest.parentMenuItemId,
      index: menuItemRequest.index
    }
  });
}

/**
 * 获取菜单项
 * @param menuId 菜单 ID
 * @param tree 是否为树形结构
 */
export function getMenuItems(menuId: number, tree: boolean = true) {
  return service({
    url: `/admin/menu/item/${menuId}?tree=${tree}`,
    method: 'GET'
  });
}
