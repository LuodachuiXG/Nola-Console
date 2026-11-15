import service from './index.ts';
import { CommentSort } from '../models/enum/CommentSort.ts';

/**
 * 分页获取操作记录
 * @param page 当前页数（0 获取全部）
 * @param size 每页条数
 * @param sort 排序方式
 */
export function getOperations(
  page: number,
  size: number,
  sort: CommentSort = CommentSort.CREATE_TIME_DESC
) {
  return service({
    url: `/admin/operation?page=${page}&size=${size}&sort=${sort}`,
    method: 'GET'
  });
}

/**
 * 根据操作记录 ID 数组删除操作记录
 * @param ids 操作记录 ID 数组
 */
export function delOperations(ids: Array<number>) {
  return service({
    url: '/admin/operation',
    method: 'DELETE',
    data: ids
  });
}

/**
 * 删除全部操作记录
 */
export function delAllOperations() {
  return service({
    url: '/admin/operation/all',
    method: 'DELETE'
  });
}

/**
 * 删除指定时间以前的操作记录
 * @param time 时间戳（毫秒）
 */
export function delOperationsBefore(time: number) {
  return service({
    url: `/admin/operation/before/${time}`,
    method: 'DELETE'
  });
}
