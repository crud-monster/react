import axios from 'axios'
import { store } from '../store'
import { logout, sessionRefreshed } from '../reducers/userSlice'
import { refreshToken } from '../refreshToken'
import { getSessionUser, sessionRevision } from './storage'
import { sessionEndpoint, sessionRequestOptions, usesHttpOnlySession } from './config'
import type { Session } from './types'

let pending: { revision: number; promise: Promise<Session> } | undefined

function validateSession(value: unknown): Session {
  if (!value || typeof value !== 'object') throw new Error('Invalid session response')
  const session = value as Session
  if (typeof session.token !== 'string' || !session.token ||
    typeof session.user?.id !== 'string' || typeof session.user.email !== 'string' ||
    typeof session.user.verified !== 'boolean' || !Array.isArray(session.user.roles) ||
    !session.user.roles.every(role => typeof role?.name === 'string') ||
    (!usesHttpOnlySession() && (typeof session.refreshToken !== 'string' || !session.refreshToken))) {
    throw new Error('Invalid session response')
  }
  return session
}

export function refreshSession(): Promise<Session> {
  const revision = sessionRevision()
  if (pending?.revision === revision) return pending.promise
  const promise = Promise.resolve().then(refreshToken).then(({ data }) => {
    if (sessionRevision() !== revision) throw new Error('Session changed while refreshing')
    const session = validateSession(usesHttpOnlySession() ? data : {
      ...data.data?.refreshToken_v1,
      user: getSessionUser(),
    })
    store.dispatch(sessionRefreshed(session))
    return session
  }).catch(error => {
    // An earlier account must never clear a more recent login or restore a logged-out session.
    if (sessionRevision() === revision) store.dispatch(logout())
    throw error
  }).finally(() => { if (pending?.promise === promise) pending = undefined })
  pending = { revision, promise }
  return promise
}

export async function logoutSession() {
  const cookieMode = usesHttpOnlySession()
  // Clear credentials immediately, even if the revocation endpoint is unreachable.
  store.dispatch(logout())
  if (cookieMode) await axios.post(sessionEndpoint('logout'), {}, sessionRequestOptions())
}
