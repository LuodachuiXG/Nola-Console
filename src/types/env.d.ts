/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 图片基地址（用于在开发环境下让相对地址的图片可以正确显示） */
  readonly VITE_IMG_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}