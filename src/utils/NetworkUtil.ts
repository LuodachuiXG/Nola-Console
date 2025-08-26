// 基地址，生产环境和开发环境不同
const baseUrl = import.meta.env.VITE_BASE_URL;

/**
 * 获取真实 URL 地址
 * 首先判断地址是否是绝对地址，如果是绝对地址就直接返回地址。
 * 如果是相对地址，则加上基地址
 * @param url 地址
 */
export const getRealUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith('http')) return url;
  return baseUrl + url;
}