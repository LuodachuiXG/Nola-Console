/**
 * 修改评论请求接口
 */
export interface CommentUpdateRequest {
  /** 评论 ID **/
  commentId: number;
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
