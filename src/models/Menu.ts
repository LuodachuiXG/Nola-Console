/**
 * 菜单接口
 */
export interface Menu {
  /** 菜单 ID **/
  menuId: number,
  /** 是否主菜单 **/
  isMain: boolean,
  /** 菜单名称 **/
  displayName: string,
  /** 创建时间 **/
  createTime: number
}