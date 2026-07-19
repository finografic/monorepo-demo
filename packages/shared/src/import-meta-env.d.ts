interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly VITE_AUTH_API_BASE_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_AWS_FRONTEND_URL?: string;
  readonly VITE_DEMO_AI_PIPELINE_URL?: string;
  readonly VITE_DEMO_DATAVIS_URL?: string;
  readonly VITE_DEMO_XSCAN_URL?: string;
  readonly VITE_DEMO_XSCAN_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

