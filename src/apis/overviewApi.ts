import service from './index.ts';
import { OverviewOnlineCount } from '../models/Overview.ts';
import { useUserStore } from '../stores/UserStore.ts';

/**
 * SSE 请求错误
 */
export class SseHttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`SSE 连接失败：${status}`);
    this.name = 'SseHttpError';
    this.status = status;
  }
}

/**
 * 获取博客概览数据
 */
export function getOverview() {
  return service({
    url: '/admin/overview',
    method: 'GET'
  });
}

/**
 * 订阅管理端在线人数 SSE
 * EventSource 无法携带 Authorization 请求头，因此使用 fetch 流式读取
 * @param signal AbortSignal，用于取消订阅
 * @param onMessage 收到在线人数时的回调
 */
export async function streamOverviewOnline(
  signal: AbortSignal,
  onMessage: (online: OverviewOnlineCount) => void
) {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/admin/overview/online`,
    {
      headers: {
        Authorization: `Bearer ${useUserStore().token}`
      },
      signal
    }
  );

  if (!response.ok || !response.body) {
    throw new SseHttpError(response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  /**
   * 处理单个 SSE 事件
   * @param rawEvent 原始事件文本
   */
  const dispatchEvent = (rawEvent: string) => {
    const dataLines = rawEvent
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart());
    if (dataLines.length === 0) return;

    const data = dataLines.join('\n');
    // 心跳包数据为 ping，忽略
    if (!data || data === 'ping') return;

    try {
      onMessage(JSON.parse(data) as OverviewOnlineCount);
    } catch {
      // 忽略无法解析的事件
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let separator = buffer.match(/\r?\n\r?\n/);
    while (separator && separator.index !== undefined) {
      dispatchEvent(buffer.slice(0, separator.index));
      buffer = buffer.slice(separator.index + separator[0].length);
      separator = buffer.match(/\r?\n\r?\n/);
    }
  }
}
