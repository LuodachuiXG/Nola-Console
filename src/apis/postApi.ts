import { PostRequest } from '../models/PostRequest.ts';
import service from './index.ts';
import { PostStatus } from '../models/enum/PostStatus.ts';
import { PostVisible } from '../models/enum/PostVisible.ts';
import { PostSort } from '../models/enum/PostSort.ts';

/**
 * 添加文章
 * @param postRequest 文章请求接口
 */
export function addPost(postRequest: PostRequest) {
  return service({
    url: '/admin/post',
    method: 'POST',
    data: postRequest
  });
}

/**
 * 删除文章
 * 只能删除已经回收的文章
 * @param ids 文章 ID 数组
 */
export function delPost(ids: Array<number>) {
  return service({
    url: '/admin/post',
    method: 'DELETE',
    data: ids
  });
}

/**
 * 回收文章，将文章放入回收站
 * 删除文章前的必要操作
 * @param ids 文章 ID 数组
 */
export function recyclePost(ids: Array<number>) {
  return service({
    url: '/admin/post/recycle',
    method: 'PUT',
    data: ids
  });
}

/**
 * 修改文章
 * @param postRequest 文章请求接口
 */
export function updatePost(postRequest: PostRequest) {
  return service({
    url: '/admin/post',
    method: 'PUT',
    data: postRequest
  });
}

/**
 * 修改文章状态
 * @param postId 文章 ID
 * @param status 文章状态
 * @param visible 文章可见性
 * @param pinned 文章置顶
 */
export function updatePostStatus(
  postId: number,
  status: PostStatus | null = null,
  visible: PostVisible | null = null,
  pinned: boolean | null = null
) {
  return service({
    url: '/admin/post/status',
    method: 'PUT',
    data: {
      postId: postId,
      status: status,
      visible: visible,
      pinned: pinned
    }
  });
}

/**
 * 获取文章
 */
export function posts(
  page: number = 0,
  size: number = 0,
  status: PostStatus | null,
  visible: PostVisible | null,
  key: string | null,
  tagId: number | null,
  categoryId: number | null,
  sort: PostSort | null
) {
  let url = `/admin/post?page=${page}&size=${size}`;
  if (status) {
    url += `&status=${status}`;
  }
  if (visible) {
    url += `&visible=${visible}`;
  }
  if (key) {
    url += `&key=${key}`;
  }
  if (tagId) {
    url += `&tag=${tagId}`;
  }
  if (categoryId) {
    url += `&category=${categoryId}`;
  }
  if (sort) {
    url += `&sort=${sort}`;
  }
  return service({
    url: url,
    method: 'GET'
  });
}

/**
 * 获取文章正文和草稿
 * @param postId 文章 ID
 */
export function postContents(postId: number) {
  return service({
    url: `/admin/post/content/${postId}`,
    method: 'GET'
  });
}

/**
 * 修改文章正文
 * @param postId 文章 ID
 * @param content 文章正文（Markdown / PlainText）
 */
export function updatePostContent(postId: number, content: string) {
  return service({
    url: '/admin/post/publish',
    method: 'PUT',
    data: {
      postId: postId,
      content: content
    }
  });
}

/**
 * 获取文章正文
 * @param postId 文章 ID
 */
export function postContent(postId: number) {
  return service({
    url: `/admin/post/publish/${postId}`,
    method: 'GET'
  });
}

/**
 * 添加文章草稿
 * @param postId 文章 ID
 * @param content 文章草稿（Markdown / PlainText）
 * @param draftName 草稿名称
 */
export function addPostDraft(
  postId: number,
  content: string,
  draftName: string
) {
  return service({
    url: '/admin/post/content/draft',
    method: 'POST',
    data: {
      postId: postId,
      content: content,
      draftName: draftName
    }
  });
}

/**
 * 删除文章草稿
 * @param postId 文章 ID
 * @param draftNames 草稿名称数组
 */
export function delPostDraft(postId: number, draftNames: Array<string>) {
  return service({
    url: `/admin/post/content/${postId}/draft`,
    method: 'DELETE',
    data: draftNames
  });
}

/**
 * 修改文章草稿
 * @param postId 文章 ID
 * @param content 文章草稿（Markdown / PlainText）
 * @param draftName 草稿名称
 */
export function updatePostDraft(
  postId: number,
  content: string,
  draftName: string
) {
  return service({
    url: '/admin/post/content/draft',
    method: 'PUT',
    data: {
      postId: postId,
      content: content,
      draftName: draftName
    }
  });
}

/**
 * 修改文章草稿名
 * @param postId 文章 ID
 * @param oldName 老草稿名
 * @param newName 新草稿名
 */
export function updatePostDraftName(
  postId: number,
  oldName: string,
  newName: string
) {
  return service({
    url: '/admin/post/content/draft/name',
    method: 'PUT',
    data: {
      postId: postId,
      oldName: oldName,
      newName: newName
    }
  });
}

/**
 * 将文章草稿转为文章正文
 * @param postId 文章 ID
 * @param draftName 草稿名
 * @param deleteContent 是否删除原来的正文
 * @param contentName 正文草稿名，如果不删除正文（deleteContent = false）
 *                    原先的正文将转为草稿，如果此项留空，将默认使用被转换为正文的旧草稿名。
 */
export function updatePostDraftToPublish(
  postId: number,
  draftName: string,
  deleteContent: boolean = false,
  contentName: string | null
) {
  return service({
    url: '/admin/post/content/draft/publish',
    method: 'PUT',
    data: {
      postId: postId,
      draftName: draftName,
      deleteContent: deleteContent,
      contentName: contentName
    }
  });
}

/**
 * 获取文章草稿
 * @param postId 文章 ID
 * @param draftName 草稿名
 */
export function postDraft(postId: number, draftName: string) {
  return service({
    url: `/admin/post/content/${postId}/draft/${draftName}`,
    method: 'GET'
  });
}
