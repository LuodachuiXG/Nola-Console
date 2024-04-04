/**
 * 文件存储策略枚举类
 */
export enum FileStorageMode {
  /** 本地存储 **/
  LOCAL = 'LOCAL',
  /** 腾讯云 COS **/
  TENCENT_COS = 'TENCENT_COS'
}

/**
 * 文件存储策略显示名称
 */
export enum FileStorageDisplayName {
  LOCAL = '本地存储',
  TENCENT_COS = '腾讯云对象存储'
}