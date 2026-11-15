/**
 * 添加评论请求接口
 */
export interface CommentRequest {
  /** 文章 ID **/
  postId: number;
  /** 父评论 ID **/
  parentCommentId: number | null;
  /** 回复的评论 ID **/
  replyCommentId: number | null;
  /** 评论内容 **/
  content: string;
  /** 评论人站点 **/
  site: string | null;
  /** 评论人名称 **/
  displayName: string;
  /** 评论人邮箱 **/
  email: string;
  /** 是否通过审核 **/
  isPass: boolean;
}
