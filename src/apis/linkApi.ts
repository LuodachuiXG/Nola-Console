import service from './index.ts';
import { LinkRequest } from '../models/request/LinkRequest.ts';
import { LinkSort } from '../models/enum/LinkSort.ts';

/**
 * 添加友情链接
 * @param linkRequest 链接请求类
 */
export function addLink(linkRequest: LinkRequest) {
  return service({
    url: '/admin/link',
    method: 'POST',
    data: linkRequest
  });
}

/**
 * 删除友情链接
 * @param linkIds 链接 ID 数组
 */
export function delLink(linkIds: Array<number>) {
  return service({
    url: '/admin/link',
    method: 'DELETE',
    data: linkIds
  });
}

/**
 * 修改友情链接
 * @param linkRequest 链接请求类
 */
export function updateLink(linkRequest: LinkRequest) {
  return service({
    url: '/admin/link',
    method: 'PUT',
    data: linkRequest
  });
}

/**
 * 获取友情链接
 */
export function getLinks(
  page: number = 0,
  size: number = 0,
  sort: LinkSort = LinkSort.PRIORITY_DESC
) {
  return service({
    url: `/admin/link?page=${page}&size=${size}&sort=${sort}`,
    method: 'GET'
  });
}
