/**
 * 访问日志类型枚举类
 */
export enum AccessLogType {
  /** 访问路径 **/
  URI = 'URI',
  /** 博客 **/
  BLOG = 'BLOG',
  /** 文章 **/
  POST = 'POST'
}

/**
 * 访问日志类型显示名称
 */
export enum AccessLogTypeDisplayName {
  URI = '路径',
  BLOG = '博客',
  POST = '文章'
}
