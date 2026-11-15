import service from './index.ts';
import { RestoreConflictStrategy } from '../models/enum/RestoreConflictStrategy.ts';
import { useUserStore } from '../stores/UserStore.ts';

/**
 * 导入 Markdown 或 Txt 文件作为新文章
 * @param files 待导入的文件
 */
export function importBackupPosts(files: Array<File>) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  return service({
    url: '/admin/backup/post',
    method: 'POST',
    data: formData
  });
}

/**
 * 导出文章为 Markdown 压缩包
 */
export function exportBackupPosts() {
  return service({
    url: '/admin/backup/post',
    method: 'GET'
  });
}

/**
 * 预览备份恢复
 * @param file 备份 zip 文件
 */
export function previewBackupRestore(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return service({
    url: '/admin/backup/restore/preview',
    method: 'POST',
    data: formData
  });
}

/**
 * 执行备份恢复
 * @param token 预览接口返回的恢复令牌
 * @param conflictStrategy 冲突处理策略
 */
export function applyBackupRestore(
  token: string,
  conflictStrategy: RestoreConflictStrategy
) {
  return service({
    url: '/admin/backup/restore/apply',
    method: 'POST',
    data: {
      token: token,
      conflictStrategy: conflictStrategy
    }
  });
}

/**
 * 下载导出的备份压缩包
 * 下载接口需要鉴权，因此使用 fetch 携带 Token
 * @param fileName 备份文件名
 */
export async function downloadBackupFile(fileName: string): Promise<Blob> {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/admin/backup/download/${encodeURIComponent(
      fileName
    )}`,
    {
      headers: {
        Authorization: `Bearer ${useUserStore().token}`
      }
    }
  );

  if (!response.ok) {
    let message = '下载备份失败';
    try {
      const data = await response.json();
      message = data.errMsg ?? message;
    } catch {
      // 响应不是 JSON，使用默认错误消息
    }
    throw new Error(message);
  }

  return await response.blob();
}
