/**
 * 导入文章备份结果接口
 */
export interface ImportPostBackupResult {
  /** 文件总数 **/
  fileCount: number;
  /** 成功数量 **/
  successCount: number;
  /** 失败数量 **/
  failCount: number;
  /** 失败信息 **/
  failResult: Array<string>;
}

/**
 * 导出文章备份结果接口
 */
export interface ExportPostBackupResult {
  /** 备份文件下载路径 **/
  path: string;
  /** 文章总数 **/
  count: number;
  /** 成功数量 **/
  successCount: number;
  /** 失败数量 **/
  failCount: number;
  /** 失败信息 **/
  failResult: Array<string>;
}

/**
 * 备份恢复预览中的单个文件
 */
export interface RestorePreviewFile {
  /** 备份文件名 **/
  fileName: string;
  /** 文件名中解析出的文章 ID **/
  postId: number | null;
  /** 文件名中解析出的文章别名 **/
  slug: string | null;
  /** 文件类型：PUBLISHED / DRAFT / INVALID **/
  type: string;
  /** 预计操作 **/
  action: string;
  /** 操作原因或跳过原因 **/
  reason: string | null;
}

/**
 * 备份恢复预览接口
 */
export interface RestorePreview {
  /** 恢复令牌 **/
  token: string;
  /** 令牌过期时间戳 **/
  expiresAt: number;
  /** 备份中的文件数量 **/
  totalFiles: number;
  /** 正文文件数量 **/
  publishedFiles: number;
  /** 草稿文件数量 **/
  draftFiles: number;
  /** 预计新建文章数量 **/
  createPostCount: number;
  /** 预计更新正文的文章数量 **/
  updatePostCount: number;
  /** 预计新增草稿数量 **/
  addDraftCount: number;
  /** 冲突文件数量 **/
  conflictCount: number;
  /** 预计跳过文件数量 **/
  skipCount: number;
  /** 无法识别的文件数量 **/
  invalidCount: number;
  /** 文件明细 **/
  files: Array<RestorePreviewFile>;
  /** 恢复限制说明 **/
  warnings: Array<string>;
}

/**
 * 备份恢复执行结果接口
 */
export interface RestoreResult {
  /** 新建文章数量 **/
  createdPosts: number;
  /** 更新正文的文章数量 **/
  updatedPosts: number;
  /** 新增草稿数量 **/
  addedDrafts: number;
  /** 跳过文件数量 **/
  skippedFiles: number;
  /** 失败文件数量 **/
  failedFiles: number;
  /** 失败原因 **/
  failures: Array<string>;
}
