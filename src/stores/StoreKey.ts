/**
 * localStorage 存储项枚举类
 */
export enum StoreKey {
  /** 用户 **/
  USER,
  /** 主题 **/
  THEME,
  /** 侧边栏是否折叠 **/
  SIDER_COLLAPSED,
  /** 标签显示模式 **/
  TAG_MODE,
  /** 标签页每页大小 **/
  TAG_PAGE_SIZE,
  /** 分类页每页大小 **/
  CATEGORY_PAGE_SIZE,
  /** 文章页每页大小 **/
  POST_PAGE_SIZE,
  /** 文章编辑自动保存间隔 **/
  POST_AUTO_SAVE_INTERVAL,
  /** 链接页每页大小 **/
  LINK_PAGE_SIZE,
  /** 日记页每页大小 **/
  DIARY_PAGE_SIZE,
  /** 文件页每页大小 **/
  FILE_PAGE_SIZE,
  /** 文件上传存储策略 **/
  FILE_UPLOAD_STORAGE_MODE,
  /** 文件上传文件组 **/
  FILE_UPLOAD_FILE_GROUP
}
