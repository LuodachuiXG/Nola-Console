import { FileStorageMode } from '../enum/FileStorageMode.ts';

/**
 * 文件删除请求接口
 */
export interface FileDelRequest {
  /** 文件名 **/
  name: string,
  /** 存储方式 **/
  storageMode: FileStorageMode
}