import service from './index.ts';
import { TencentCOSConfig } from '../models/TencentCOSConfig.ts';
import { FileStorageMode } from '../models/enum/FileStorageMode.ts';
import { FileDelRequest } from '../models/request/FileDelRequest.ts';
import { FileSort } from '../models/enum/FileSort.ts';

/**
 * 获取所有已经配置的存储策略
 * 默认包含本次存储 LOCAL
 */
export function getStorageModes() {
  return service({
    url: '/admin/file/mode',
    method: 'GET'
  });
}

/**
 * 配置腾讯云对象存储策略
 * @param config 腾讯云配置接口
 */
export function setTencentCOS(config: TencentCOSConfig) {
  return service({
    url: '/admin/file/mode/tencent_cos',
    method: 'POST',
    data: config
  });
}

/**
 * 获取腾讯云对象存储策略配置
 */
export function getTencentCOS() {
  return service({
    url: '/admin/file/mode/tencent_cos',
    method: 'GET'
  });
}

/**
 * 删除腾讯云对象存储策略
 */
export function delTencentCOS() {
  return service({
    url: '/admin/file/mode/tencent_cos',
    method: 'DELETE'
  });
}

/**
 * 添加文件组
 * @param displayName 文件组名
 * @param path 文件组路径
 * @param storageMode 存储策略
 */
export function addFileGroup(
  displayName: string,
  path: string,
  storageMode: FileStorageMode
) {
  return service({
    url: '/admin/file/group',
    method: 'POST',
    data: {
      displayName: displayName,
      path: path,
      storageMode: storageMode
    }
  });
}

/**
 * 删除文件组
 * @param fileGroupId 文件组 ID
 */
export function delFileGroup(fileGroupId: number) {
  return service({
    url: `/admin/file/group/${fileGroupId}`,
    method: 'DELETE'
  });
}

/**
 * 修改文件组
 * @param fileGroupId 文件组 ID
 * @param displayName 文件组名
 */
export function updateFileGroup(fileGroupId: number, displayName: string) {
  return service({
    url: '/admin/file/group',
    method: 'PUT',
    data: {
      fileGroupId: fileGroupId,
      displayName: displayName
    }
  });
}

/**
 * 根据文件存储策略获取文件组
 * @param fileStorageMode 文件存储策略（为 null 就获取所有文件组）
 */
export function getFileGroups(fileStorageMode: FileStorageMode | null) {
  let url = '/admin/file/group';
  if (fileStorageMode != null) {
    url += `?fileStorageMode=${fileStorageMode}`;
  }
  return service({
    url: url,
    method: 'GET'
  });
}

/**
 * 根据文件 ID 删除文件
 * @param ids 文件 ID 数组
 */
export function delFilesByIds(ids: Array<number>) {
  return service({
    url: '/admin/file',
    method: 'DELETE',
    data: ids
  });
}

/**
 * 根据文件名删除文件
 * @param names 文件删除请求接口数组
 */
export function delFilesByNames(names: Array<FileDelRequest>) {
  return service({
    url: '/admin/file/name',
    method: 'DELETE',
    data: names
  });
}

/**
 * 移动文件
 * 只能在相同存储策略中移动
 * @param fileIds 待移动的文件 ID 数组
 * @param newFileGroupId 目标文件组 ID，准备将文件移动到哪个文件组。为 null 则移动到默认分组。
 */
export function moveFiles(
  fileIds: Array<number>,
  newFileGroupId: number | null
) {
  return service({
    url: '/admin/file',
    method: 'PUT',
    data: {
      fileIds: fileIds,
      newFileGroupId: newFileGroupId
    }
  });
}

/**
 * 获取文件列表
 * @param page 页码
 * @param size 每页数量
 * @param sort 排序
 * @param mode 文件存储策略
 * @param key 搜索关键字
 */
export function getFiles(
  page: number,
  size: number,
  sort: FileSort | null,
  mode: FileStorageMode | null,
  key: string | null
) {
  let url = `/admin/file?page=${page}&size=${size}`;
  if (sort) {
    url += `&sort=${sort}`;
  }
  if (mode) {
    url += `&mode=${mode}`;
  }
  if (key) {
    url += `&key=${key}`;
  }
  return service({
    url: url,
    method: 'GET'
  });
}
