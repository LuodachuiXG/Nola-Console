import { FileStorageMode } from './enum/FileStorageMode.ts';

/**
 * 文件接口
 */
export interface File {
  /** 文件 ID **/
  fileId: number;
  /** 文件组 ID **/
  fileGroupId: number | null;
  /** 文件组名称 **/
  fileGroupName: string | null;
  /** 文件名称 **/
  displayName: string;
  /** 文件路径 **/
  url: string;
  /** 文件大小 **/
  size: number;
  /** 存储方式 **/
  storageMode: FileStorageMode;
  /** 创建时间 **/
  createTime: number;
}
