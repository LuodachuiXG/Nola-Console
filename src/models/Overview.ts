import { Category } from './Category.ts';
import { Post } from './Post.ts';
import { Tag } from './Tag.ts';

/**
 * 概览项目数量
 */
export interface OverviewCount {
  /** 文章数量 **/
  post: number;
  /** 标签数量 **/
  tag: number;
  /** 分类数量 **/
  category: number;
  /** 评论数量 **/
  comment: number;
  /** 日常数量 **/
  diary: number;
  /** 文件数量 **/
  file: number;
  /** 链接数量 **/
  link: number;
  /** 菜单数量 **/
  menu: number;
}

/**
 * 概览接口
 */
export interface Overview {
  /** 文章总浏览量 **/
  postVisitCount: number;
  /** 项目数量 **/
  count: OverviewCount;
  /** 文章最多的 6 个标签 **/
  tags: Array<Tag>;
  /** 文章最多的 6 个分类 **/
  categories: Array<Category>;
  /** 浏览量最多的文章 **/
  mostViewedPost: Post | null;
  /** 最近的一次操作 **/
  lastOperation: string | null;
  /** 最后登录时间 **/
  lastLoginDate: number | null;
  /** 博客创建时间 **/
  createDate: number | null;
}

/**
 * 在线人数接口
 */
export interface OverviewOnlineCount {
  /** 在线人数 **/
  count: number;
  /** 时间戳 **/
  timestamp: number;
}
