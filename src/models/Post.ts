import { PostStatus } from './enum/PostStatus.ts';
import { PostVisible } from './enum/PostVisible.ts';
import { Category } from './Category.ts';
import { Tag } from './Tag.ts';

/**
 * 文章接口
 */
export interface Post {
  /** 文章ID **/
  postId: number;
  /** 文章标题 **/
  title: string;
  /** 是否自动生成摘要 **/
  autoGenerateExcerpt: boolean;
  /** 文章摘要 **/
  excerpt: string;
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
  /** 文章是否有密码 **/
  encrypted: boolean;
  /** 文章密码，始终为 null，密码不会返回 **/
  password: null;
  /** 文章访问量 **/
  visit: number;
  /** 文章分类 */
  category: Category | null;
  /** 文章标签数组 */
  tags: Array<Tag>;
  /** 文章创建时间戳 **/
  createTime: number;
  /** 文章最后修改时间戳 */
  lastModifyTime: number | null;
}
