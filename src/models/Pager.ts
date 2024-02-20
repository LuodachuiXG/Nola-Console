/**
 * 分页接口
 */
export interface Pager<T> {
  /** 当前页 **/
  page: number,
  /** 每页条数 **/
  size: number,
  /** 数据集合 **/
  data: Array<T>,
  /** 总条数 **/
  totalData: number,
  /** 总页数 **/
  totalPage: number
}