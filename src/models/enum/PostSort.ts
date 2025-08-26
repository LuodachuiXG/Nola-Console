/**
 * 文章排序枚举类
 */
export enum PostSort {
  /** 创建时间降序（默认） **/
  CREATE_DESC = 'CREATE_DESC',
  /** 创建时间升序 **/
  CREATE_ASC = 'CREATE_ASC',
  /** 最后修改时间降序 **/
  MODIFY_DESC = 'MODIFY_DESC',
  /** 最后修改时间升序 **/
  MODIFY_ASC = 'MODIFY_ASC',
  /** 访问量降序 **/
  VISIT_DESC = 'VISIT_DESC',
  /** 访问量升序 **/
  VISIT_ASC = 'VISIT_ASC',
  /** 置顶排序 **/
  PINNED = 'PINNED'
}