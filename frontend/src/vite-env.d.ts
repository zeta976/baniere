/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_COURSE_API_URL?: string;
  readonly VITE_TERM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
