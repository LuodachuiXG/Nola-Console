import { PostContentStatus } from './enum/PostContentStatus.ts';

/**
 * 文章内容接口
 */
export interface PostContent {
  /** 文章内容 ID **/
  postContentId: number | null;
  /** 文章 ID **/
  postId: number;
  /** 文章内容 **/
  content: string | null,
  /** 文章内容状态 **/
  status: PostContentStatus,
  /** 草稿名称 **/
  draftName: string | null,
  /** 最后修改时间戳 **/
  lastModifyTime: number | null
}