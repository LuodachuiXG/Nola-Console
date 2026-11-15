import SecureLSModule from 'secure-ls';

// secure-ls 的 CJS 产物带 __esModule 标记，部分打包器（如 Rolldown/Vite 8）
// 会把默认导入解析为 { default: SecureLS } 包装对象，这里统一解包
const SecureLS = ((SecureLSModule as unknown as { default?: typeof SecureLSModule })
  .default ?? SecureLSModule);

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
