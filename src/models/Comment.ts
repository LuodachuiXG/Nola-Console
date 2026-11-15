/**
 * 评论接口
 */
export interface Comment {
  /** 评论 ID **/
  commentId: number;
  /** 文章 ID **/
  postId: number;
  /** 文章标题 **/
  postTitle: string | null;
  /** 父评论 ID **/
  parentCommentId: number | null;
  /** 回复的评论 ID **/
  replyCommentId: number | null;
  /** 回复的评论用户名 **/
  replyDisplayName: string | null;
  /** 评论内容 **/
  content: string;
  /** 评论人站点 **/
  site: string | null;
  /** 评论人名称 **/
  displayName: string;
  /** 评论人邮箱 **/
  email: string;
  /** 评论时间 **/
  createTime: number;
  /** 是否通过审核 **/
  isPass: boolean;
  /** 子评论集合 **/
  children: Array<Comment> | null;
}
