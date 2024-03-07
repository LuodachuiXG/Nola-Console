import { PostStatus } from './enum/PostStatus.ts';
import { PostVisible } from './enum/PostVisible.ts';

/**
 * 文章接口
 */
export interface PostRequest {
  /** 文章 ID（添加时为 null，修改时必填） **/
  postId: number | null;
  /** 文章标题 **/
  title: string;
  /** 是否自动生成摘要 **/
  autoGenerateExcerpt: boolean;
  /** 文章摘要 **/
  excerpt: string | null;
  /** 文章别名 **/
  slug: string;
  /** 文章封面 **/
  cover: string | null;
  /** 是否允许评论 **/
  allowComment: boolean;
  /** 是否置顶 **/
  pinned: boolean;
  /** 文章状态 **/
  status: PostStatus;
  /** 文章可见性 **/
  visible: PostVisible;
  /** 文章密码 **/
  password: string | null;
  /** 文章分类 ID */
  categoryId: number;
  /** 文章标签 ID 数组 */
  tagIds: Array<number>;
  /** 文章正文 (添加时必填，修改时为 null） **/
  content: string | null;
}
