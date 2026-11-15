import { OperationType } from './enum/OperationType.ts';

/**
 * 操作记录接口
 */
export interface Operation {
  /** 操作记录 ID **/
  operationId: number;
  /** 操作用户 ID **/
  userId: number;
  /** 操作用户名 **/
  username: string;
  /** 操作类型 **/
  operationType: OperationType;
  /** 操作描述 **/
  operationDesc: string | null;
  /** 操作时间 **/
  createTime: number;
}
