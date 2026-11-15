import service from './index.ts';
import { CommentSort } from '../models/enum/CommentSort.ts';
import { CommentRequest } from '../models/request/CommentRequest.ts';
import { CommentUpdateRequest } from '../models/request/CommentUpdateRequest.ts';

/**
 * 评论查询参数
 */
export interface CommentQuery {
  /** 文章 ID **/
  postId?: number | null;
  /** 评论 ID **/
  commentId?: number | null;
  /** 父评论 ID **/
  parentCommentId?: number | null;
  /** 是否通过审核 **/
  isPass?: boolean | null;
  /** 搜索关键字 **/
  key?: string | null;
  /** 排序方式 **/
  sort?: CommentSort | null;
  /** 是否返回树形结构 **/
  tree?: boolean;
}

/**
 * 添加评论
 * @param comment 添加评论请求接口
 */
export function addComment(comment: CommentRequest) {
  return service({
    url: '/admin/comment',
    method: 'POST',
    data: comment
  });
}

/**
 * 根据评论 ID 数组删除评论
 * @param ids 评论 ID 数组
 */
export function delComments(ids: Array<number>) {
  return service({
    url: '/admin/comment',
    method: 'DELETE',
    data: ids
  });
}

/**
 * 修改评论
 * @param comment 修改评论请求接口
 */
export function updateComment(comment: CommentUpdateRequest) {
  return service({
    url: '/admin/comment',
    method: 'PUT',
    data: comment
  });
}

/**
 * 批量设置评论审核状态
 * @param ids 评论 ID 数组
 * @param isPass 是否通过审核
 */
export function setCommentsPass(ids: Array<number>, isPass: boolean) {
  return service({
    url: '/admin/comment/pass',
    method: 'PUT',
    data: {
      ids: ids,
      isPass: isPass
    }
  });
}

/**
 * 分页获取评论
 * @param page 当前页数（0 获取全部）
 * @param size 每页条数
 * @param query 查询参数
 */
export function getComments(
  page: number,
  size: number,
  query: CommentQuery = {}
) {
  let url = `/admin/comment?page=${page}&size=${size}`;
  if (query.postId != null) {
    url += `&postId=${query.postId}`;
  }
  if (query.commentId != null) {
    url += `&commentId=${query.commentId}`;
  }
  if (query.parentCommentId != null) {
    url += `&parentCommentId=${query.parentCommentId}`;
  }
  if (query.isPass != null) {
    url += `&isPass=${query.isPass}`;
  }
  if (query.key) {
    url += `&key=${encodeURIComponent(query.key)}`;
  }
  if (query.sort) {
    url += `&sort=${query.sort}`;
  }
  if (query.tree != null) {
    url += `&tree=${query.tree}`;
  }
  return service({
    url: url,
    method: 'GET'
  });
}
