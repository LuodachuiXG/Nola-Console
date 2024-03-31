/**
 * 日常接口
 */
export interface Diary {
  /** 日常 ID **/
  diaryId: number;
  /** 日常内容 **/
  content: string;
  /** 日常内容 HTML **/
  html: string;
  /** 创建时间 **/
  createTime: number;
  /** 最后修改时间 **/
  lastModifyTime: number;
}
