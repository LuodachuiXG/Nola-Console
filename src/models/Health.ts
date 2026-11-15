/**
 * 健康检查接口
 */
export interface Health {
  /** 服务整体状态：UP / DEGRADED **/
  status: string;
  /** 数据库是否可用 **/
  database: boolean;
  /** Redis 是否可用 **/
  redis: boolean;
  /** 服务器时间戳 **/
  time: number;
}
