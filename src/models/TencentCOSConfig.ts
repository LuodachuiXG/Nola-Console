/**
 * 腾讯云对象存储配置接口
 */
export interface TencentCOSConfig {
  /** 密钥 ID **/
  secretId: string;
  /** 密钥 KEY **/
  secretKey: string;
  /** 存储区域 **/
  region: string;
  /** 存储桶名 **/
  bucket: string;
  /** 是否使用 HTTPS **/
  https: boolean;
  /** 存储路径 **/
  path: string | null;
}
