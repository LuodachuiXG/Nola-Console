/**
 * 友情链接接口
 */
export interface Link {
  /** 友情链接 ID **/
  linkId: number;
  /** 友情链接名称 **/
  displayName: string;
  /** 友链 URL **/
  url: string;
  /** 友链 Logo **/
  logo: string | null;
  /** 友链描述 **/
  description: string | null;
  /** 友链优先级 **/
  priority: number;
  /** 友链备注 **/
  remark: string | null;
  /** 创建时间 **/
  createTime: number;
  /** 最后更新时间 **/
  lastModifyTime: number | null;
}
