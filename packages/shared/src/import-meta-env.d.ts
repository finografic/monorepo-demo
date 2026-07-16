interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly VITE_AUTH_API_BASE_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DEMO_XSCAN_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
