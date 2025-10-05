/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENV: string
  VITE_USE_MOCK_DATA: string
  VITE_FIREBASE_API_KEY: string
  VITE_FIREBASE_AUTH_DOMAIN: string
  VITE_FIREBASE_PROJECT_ID: string
  VITE_FIREBASE_STORAGE_BUCKET: string
  VITE_FIREBASE_MESSAGING_SENDER_ID: string
  VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
