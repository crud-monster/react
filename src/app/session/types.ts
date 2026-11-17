export interface UserRole { name: string }
export interface User {
  id: string
  email: string
  verified: boolean
  roles: UserRole[]
  selectedOrgId?: string
}

export interface Session {
  token: string
  user: User
  refreshToken?: string
}

export type UserWithToken = User & { token: string }
