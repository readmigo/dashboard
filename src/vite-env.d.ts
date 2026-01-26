/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_DISABLED: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
