/// <reference types="vite/client" />

interface ImportMetaEnv {
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
