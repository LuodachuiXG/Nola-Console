/**
 * 备份恢复冲突处理策略
 */
export enum RestoreConflictStrategy {
  /** 跳过冲突文件 **/
  SKIP = 'SKIP',
  /** 重命名冲突文章 **/
  RENAME = 'RENAME'
}
