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
 * 获取所有分类
 */
export function allCategories() {
  return service({
    url: '/admin/category',
    method: 'GET'
  });
}

/**
 * 分页获取分类
 * @param page 当前页数
 * @param size 每页条数
 */
export function categoriesByPage(page: number, size: number) {
  return service({
    url: `/admin/category/${page}/${size}`,
    method: 'GET'
  });
}
