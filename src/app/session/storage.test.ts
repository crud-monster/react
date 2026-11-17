import { vi } from 'vitest'
import { parse, print } from 'graphql'
import { clearSession, getAccessToken, getRefreshToken, getSession, saveSession } from './storage'
import { sessionDocument } from './documents'
import { sessionEndpoint } from './config'

const session = { token: 'access', refreshToken: 'refresh', user: { id: '1', email: 'user@example.test', verified: false, roles: [] } }
beforeEach(() => { vi.stubEnv('VITE_AUTH_MODE', 'legacy'); clearSession() })
afterEach(() => { clearSession(); vi.unstubAllEnvs() })

test('legacy sessions still persist and restore false verification correctly', () => {
  saveSession(session)
  expect(getSession()).toEqual(session)
  expect(getSession()?.user.verified).toBe(false)
  expect(localStorage.getItem('user.refreshToken')).toBe('refresh')
})

test('HttpOnly mode purges legacy data and never persists either token or user identity', () => {
  saveSession(session)
  vi.stubEnv('VITE_AUTH_MODE', 'http-only')
  expect(getSession()).toBeUndefined()
  expect(localStorage.length).toBe(0)
  saveSession(session)
  expect(getAccessToken()).toBe('access')
  expect(getRefreshToken()).toBeUndefined()
  expect(getSession()).toEqual({ token: 'access', user: session.user })
  expect(localStorage.length).toBe(0)
  expect(sessionStorage.length).toBe(0)
  clearSession()
  expect(getAccessToken()).toBeUndefined()
})

test('authentication documents do not request refresh credentials in HttpOnly mode', () => {
  const document = parse('mutation Login { login_v1 { token refreshToken user { id } } }')
  expect(print(sessionDocument(document))).toContain('refreshToken')
  vi.stubEnv('VITE_AUTH_MODE', 'http-only')
  expect(print(sessionDocument(document))).not.toContain('refreshToken')
  expect(print(sessionDocument(document))).toContain('token')
})

test('cookie mode still works when browser policy blocks Web Storage', () => {
  vi.stubEnv('VITE_AUTH_MODE', 'http-only')
  const blocked = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('Storage disabled') })
  try {
    saveSession(session)
    expect(getSession()?.token).toBe('access')
    clearSession()
    expect(getAccessToken()).toBeUndefined()
  } finally { blocked.mockRestore() }
})

test('cookie endpoint configuration fails closed instead of falling back to legacy', () => {
  vi.stubEnv('VITE_AUTH_MODE', 'http-only')
  vi.stubEnv('VITE_SESSION_REFRESH_URL', '')
  expect(() => sessionEndpoint('refresh')).toThrow('Configure VITE_SESSION_REFRESH_URL')
  vi.stubEnv('VITE_SESSION_REFRESH_URL', 'http://api.example.test/refresh')
  expect(() => sessionEndpoint('refresh')).toThrow('HTTPS')
  vi.stubEnv('VITE_SESSION_REFRESH_URL', 'http://localhost:4000/refresh')
  expect(sessionEndpoint('refresh')).toBe('http://localhost:4000/refresh')
})
