import SecureLS from 'secure-ls';

/**
 * 自定义加密解密方法
 */
const ls = new SecureLS({
  // 是否压缩
  isCompression: false,
  // 加密秘钥
  encryptionSecret: import.meta.env.VITE_ENCRYPTION_KEY
});
/**
 * 加密解密方法
 */
export const SecureLSStorage = {
  setItem(key: string, value: any) {
    ls.set(key, value)
  },
  getItem(key: string) {
    return ls.get(key);
  }
};
