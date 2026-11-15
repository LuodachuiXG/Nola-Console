import service from './index.ts';

/**
 * 分页获取访问日志
 * @param page 当前页数（0 获取全部）
 * @param size 每页条数
 */
export function getAccessLogs(page: number, size: number) {
  return service({
    url: `/admin/access-log?page=${page}&size=${size}`,
    method: 'GET'
  });
}

/**
 * 获取访问日志总数
 */
export function getAccessLogCount() {
  return service({
    url: '/admin/access-log/count',
    method: 'GET'
  });
}

/**
 * 获取单条访问日志
 * @param id 访问日志 ID
 */
export function getAccessLog(id: number) {
  return service({
    url: `/admin/access-log/${id}`,
    method: 'GET'
  });
}

/**
 * 根据访问日志 ID 数组删除访问日志
 * @param ids 访问日志 ID 数组
 */
export function delAccessLogs(ids: Array<number>) {
  return service({
    url: '/admin/access-log',
    method: 'DELETE',
    data: ids
  });
}

/**
 * 删除全部访问日志
 */
export function delAllAccessLogs() {
  return service({
    url: '/admin/access-log/all',
    method: 'DELETE'
  });
}

/**
 * 删除指定时间以前的访问日志
 * @param time 时间戳（毫秒）
 */
export function delAccessLogsBefore(time: number) {
  return service({
    url: `/admin/access-log/before/${time}`,
    method: 'DELETE'
  });
}
