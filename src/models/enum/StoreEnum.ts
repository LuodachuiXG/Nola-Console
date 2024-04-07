/**
 * localStorage 存储项枚举类
 */
export enum StoreEnum {
  /** 用户 **/
  USER = 'user',
  /** 主题 **/
  THEME = 'theme',
  /** 侧边栏是否折叠 **/
  SIDER_COLLAPSED = 'sider_collapsed',
  /** 标签显示模式 **/
  TAG_MODE = 'tag_mode',
  /** 标签页每页大小 **/
  TAG_PAGE_SIZE = 'tag_page_size',
  /** 分类页每页大小 **/
  CATEGORY_PAGE_SIZE = 'category_page_size',
  /** 文章页每页大小 **/
  POST_PAGE_SIZE = 'post_page_size',
  /** 文章编辑自动保存间隔 **/
  POST_AUTO_SAVE_INTERVAL = 'post_auto_save_interval',
  /** 链接页每页大小 **/
  LINK_PAGE_SIZE = 'link_page_size',
  /** 日记页每页大小 **/
  DIARY_PAGE_SIZE = 'diary_page_size',
  /** 文件页每页大小 **/
  FILE_PAGE_SIZE = 'file_page_size'
}
