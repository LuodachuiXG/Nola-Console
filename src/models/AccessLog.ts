import { AccessLogType } from './enum/AccessLogType.ts';

/**
 * 访问日志接口
 */
export interface AccessLog {
  /** 访问日志 ID **/
  accessLogId: number;
  /** 访问路径 **/
  path: string;
  /** 访问 IP **/
  ip: string;
  /** 访问时间 **/
  accessTime: number;
  /** 访问日志类型 **/
  type: AccessLogType;
  /** 消息 **/
  message: string | null;
}
