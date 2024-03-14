/**
 * 友情链接排序枚举类
 */
export enum LinkSort {
  /** 优先级降序（默认） **/
  PRIORITY_DESC = 'PRIORITY_DESC',
  /** 优先级升序 **/
  PRIORITY_ASC = 'PRIORITY_ASC',
  /** 创建时间降序 **/
  CREATE_TIME_DESC = 'CREATE_TIME_DESC',
  /** 创建时间升序 **/
  CREATE_TIME_ASC = 'CREATE_TIME_ASC',
  /** 修改时间降序 **/
  MODIFY_TIME_DESC = 'MODIFY_TIME_DESC',
  /** 修改时间升序 **/
  MODIFY_TIME_ASC = 'MODIFY_TIME_ASC'
}