import service from './index.ts';
import { Category } from '../models/Category.ts';

/**
 * 添加分类
 */
export function addCategory(category: Category) {
  return service({
    url: '/admin/category',
    method: 'POST',
    data: category
  });
}

/**
 * 根据分类 ID 数组删除分类
 */
export function delCategoriesByIds(ids: Array<number>) {
  return service({
    url: '/admin/category',
    method: 'DELETE',
    data: ids
  });
}

/**
 * 根据分类别名数组删除分类
 */
export function delCategoriesBySlugs(slugs: Array<String>) {
  return service({
    url: '/admin/category/slug',
    method: 'DELETE',
    data: slugs
  });
}

/**
 * 修改分类
 */
export function updateCategory(category: Category) {
  return service({
    url: '/admin/category',
    method: 'PUT',
    data: category
  });
}

/**
 * 根据分类 ID 获取分类
 * @param categoryId 分类 ID
 */
export function category(categoryId: number) {
  return service({
    url: `/admin/category/${categoryId}`,
    method: 'GET'
  });
}

/**
 * 分页获取分类
 * @param page 当前页数（留空或 0 获取全部）
 * @param size 每页条数
 */
export function categories(
  page: number | null = null,
  size: number | null = null
) {
  return service({
    url: `/admin/category?page=${page ?? 0}&size=${size ?? 0}`,
    method: 'GET'
  });
}
