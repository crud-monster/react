/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_MODE?: 'legacy' | 'http-only'
  readonly VITE_SESSION_REFRESH_URL?: string
  readonly VITE_SESSION_LOGOUT_URL?: string
  readonly VITE_HOST?: string
  readonly VITE_DEFAULT_USER_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.gql' {
  const document: import('graphql').DocumentNode
  export default document
}
