import service from './index.ts';
import { DiarySort } from '../models/enum/DiarySort.ts';

/**
 * 添加日记
 * @param content 日记内容
 */
export function addDiary(content: string) {
  return service({
    url: '/admin/diary',
    method: 'POST',
    data: {
      content: content
    }
  });
}

/**
 * 删除日记
 * @param ids 日记 ID 数组
 */
export function delDiaries(ids: Array<number>) {
  return service({
    url: '/admin/diary',
    method: 'DELETE',
    data: ids
  });
}

/**
 * 修改日记
 * @param diaryId 日记 ID
 * @param content 日记内容
 */
export function updateDiary(diaryId: number, content: string) {
  return service({
    url: '/admin/diary',
    method: 'PUT',
    data: {
      diaryId: diaryId,
      content: content
    }
  });
}

/**
 * 获取日记
 * @param page 当前页数（留空或 0 获取全部）
 * @param size 每条条数
 * @param sort 排序方式
 */
export function getDiaries(
  page: number | null = null,
  size: number | null = null,
  sort: DiarySort = DiarySort.CREATE_TIME_DESC
) {
  return service({
    url: `/admin/diary?page=${page ?? 0}&size=${size ?? 0}&sort=${sort}`,
    method: 'GET'
  });
}
