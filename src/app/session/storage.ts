import { usesHttpOnlySession } from './config'
import type { Session, User } from './types'

const keys = ['user.token', 'user.refreshToken', 'user.id', 'user.email', 'user.verified', 'user.roles', 'user.verifyToken']
let memory: Session | undefined
let revision = 0
let verifiedToken: string | undefined

function removePersistedSession() {
  // Cookie sessions must also work when browser policy disables Web Storage.
  try { for (const key of keys) localStorage.removeItem(key) } catch { /* No storage fallback. */ }
}

export function sessionRevision() { return revision }
export function getAccessToken() { return usesHttpOnlySession() ? memory?.token : localStorage.getItem('user.token') || undefined }
export function getRefreshToken() { return usesHttpOnlySession() ? undefined : localStorage.getItem('user.refreshToken') || undefined }

export function getSession(): Session | undefined {
  if (usesHttpOnlySession()) {
    removePersistedSession()
    return memory
  }
  const token = getAccessToken()
  const id = localStorage.getItem('user.id')
  const email = localStorage.getItem('user.email')
  if (!token || !id || !email) return undefined
  return {
    token, refreshToken: getRefreshToken(),
    user: { id, email, verified: localStorage.getItem('user.verified') === 'true', roles: (localStorage.getItem('user.roles') || '').split(',').filter(Boolean).map(name => ({ name })) },
  }
}

export function getSessionUser(): User | undefined { return getSession()?.user }

export function saveSession(session: Session, { refreshed = false } = {}) {
  if (!session.token || !session.user?.id || !session.user.email || !Array.isArray(session.user.roles)) throw new Error('Invalid session response')
  if (!usesHttpOnlySession() && !session.refreshToken) throw new Error('Legacy sessions require a refresh token')
  if (!refreshed) revision++
  if (usesHttpOnlySession()) {
    removePersistedSession()
    // Deliberately ignore any refresh token accidentally returned in a response.
    memory = { token: session.token, user: session.user }
    return
  }
  localStorage.setItem('user.token', session.token)
  localStorage.setItem('user.refreshToken', session.refreshToken!)
  localStorage.setItem('user.id', session.user.id)
  localStorage.setItem('user.email', session.user.email)
  localStorage.setItem('user.verified', String(session.user.verified === true))
  localStorage.setItem('user.roles', session.user.roles.map(role => role.name).join(','))
}

export function clearSession() {
  revision++
  memory = undefined
  verifiedToken = undefined
  removePersistedSession()
}

export function markVerificationToken(token: string) { verifiedToken = token }
export function wasVerificationTokenUsed(token: string) { return verifiedToken === token }

export function getSessionUserId() { return usesHttpOnlySession() ? memory?.user.id : localStorage.getItem('user.id') || undefined }
export function getRememberedEmail() { return usesHttpOnlySession() ? memory?.user.email || '' : localStorage.getItem('user.email') || '' }
