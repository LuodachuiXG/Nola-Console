import { StoreEnum } from '../models/enum/StoreEnum.ts';
import pinyin from 'js-pinyin';
import { Component, h } from 'vue';
import { NIcon } from 'naive-ui';

/**
 * 返回当前主题颜色
 * @return 返回当前的主题颜色：light / dark
 */
export const getCurrentTheme = () => {
  let theme = localStorage.getItem(StoreEnum.THEME) ?? 'light';
  if (theme !== 'light' && theme !== 'dark') {
    theme = 'light';
  }
  return theme;
};

/**
 * 存储主题色
 * @param theme light / dark
 */
export const setTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem(StoreEnum.THEME, theme);
};

/**
 * 将中文转拼音
 * @param chinese 中文字符串
 */
export const chineseToPinyin = (chinese: string) => {
  pinyin.setOptions({
    checkPolyphone: false,
    charCase: 1
  });
  return pinyin.getFullChars(chinese);
};

/**
 * 将显示名称转别名
 * 中文 - > 拼音
 * 空白字符 -> '-'
 * 英文字母 -> 小写
 * @param str 要处理的字符串
 */
export const displayNameToSlug = (str: string) => {
  // 先将中文转拼音
  let pinyin = chineseToPinyin(str);
  // 将所有空白字符替换成 - ，并且转小写
  return pinyin.replace(/\s+/g, '-').toLowerCase();
};

/**
 * 格式化时间戳
 * @param timestamp 时间戳
 */
export const formatTimestamp = (timestamp: number) => {
  // 创建一个新的日期实例，传入毫秒级时间戳
  const date = new Date(timestamp);

  // 使用日期方法获取年、月、日、小时和分钟
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);

  // 拼接成目标格式的字符串
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 判断当前是否为小窗口
 */
export const isCurrentSmallWindow = (): boolean => {
  return window.document.documentElement.clientWidth < 768;
};

/**
 * 判断是否为数字类型
 * @param value 数字或字符串
 */
export const isNumberType = (value: number | string): boolean => {
  return typeof value === 'number' && !isNaN(value);
};

/**
 * 判断是是否是字符串类型
 * @param value 数组或字符串
 */
export const isStringType = (value: number | string): boolean => {
  return typeof value === 'string';
};

/**
 * 判断一段文本是否是数字
 * @param str 文本
 */
export const isNumber = (str: string): boolean => {
  return !isNaN(Number(str));
};

/**
 * 渲染图标
 * @param icon 图标组件
 */
export function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}
