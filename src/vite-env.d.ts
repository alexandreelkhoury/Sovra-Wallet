/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PORTALHQ_API_KEY: string
  readonly VITE_PORTALHQ_ENVIRONMENT: string
  readonly VITE_PORTALHQ_NETWORK: string
  readonly VITE_PORTALHQ_CHAIN_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}