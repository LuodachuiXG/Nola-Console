import service from './index.ts';
import { Tag } from '../models/Tag.ts';

/**
 * 添加标签
 */
export function addTag(tag: Tag) {
  return service({
    url: '/admin/tag',
    method: 'POST',
    data: tag
  });
}

/**
 * 根据标签 ID 数组删除标签
 */
export function delTagsByIds(ids: Array<number>) {
  return service({
    url: '/admin/tag',
    method: 'DELETE',
    data: ids
  });
}

/**
 * 根据标签别名数组删除标签
 */
export function delTagsBySlugs(slugs: Array<String>) {
  return service({
    url: '/admin/tag/slug',
    method: 'DELETE',
    data: slugs
  });
}

/**
 * 修改标签
 */
export function updateTag(tag: Tag) {
  return service({
    url: '/admin/tag',
    method: 'PUT',
    data: tag
  });
}

/**
 * 分页获取标签
 * @param page 当前页数（留空或 0 获取全部）
 * @param size 每页条数
 */
export function tags(page: number | null = null, size: number | null = null) {
  return service({
    url: `/admin/tag?page=${page ?? 0}&size=${size ?? 0}`,
    method: 'GET'
  });
}
