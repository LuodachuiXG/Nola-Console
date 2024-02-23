import { StoreEnum } from '../models/enum/StoreEnum.ts';
import pinyin from 'js-pinyin';
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
 * 存储注册色
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
