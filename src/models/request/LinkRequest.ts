/**
 * 友情链接请求接口
 */
export interface LinkRequest {
  /** 链接ID **/
  linkId?: number;
  /** 链接名称 **/
  displayName: string;
  /** 链接地址 **/
  url: string;
  /** 链接图标 **/
  logo: string | null;
  /** 链接描述 **/
  description: string | null;
  /** 链接优先级 **/
  priority: number | null;
  /** 链接备注 **/
  remark: string | null;
}