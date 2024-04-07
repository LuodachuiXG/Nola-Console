import { FileStorageMode } from './enum/FileStorageMode.ts';

/**
 * 文件分组接口
 */
export interface FileGroup {
  /** 文件分组 ID **/
  fileGroupId: number,
  /** 文件分组名称 **/
  displayName: string,
  /** 文件分组路径 **/
  path: string,
  /** 文件分组存储策略 **/
  storageMode: FileStorageMode
}