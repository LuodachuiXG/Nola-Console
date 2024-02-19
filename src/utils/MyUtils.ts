import { StoreEnum } from '../models/enum/StoreEnum.ts';

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
}

