import { Health } from '../models/Health.ts';

/**
 * 获取服务健康状态
 * 该接口不使用统一响应包装，且服务降级时返回 503，因此直接使用 fetch
 */
export async function getHealth(): Promise<Health> {
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}/health`);
  return (await response.json()) as Health;
}
