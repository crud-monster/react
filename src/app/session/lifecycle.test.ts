import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { vi } from 'vitest'
import { logoutSession, refreshSession } from './lifecycle'
import { clearSession, getAccessToken } from './storage'
import { store } from '../store'
import { login, logout } from '../reducers/userSlice'

const session = { token: 'access', user: { id: '1', email: 'user@example.test', verified: true, roles: [] } }
const originalAdapter = axios.defaults.adapter
const adapter = vi.fn()
const response = (config: InternalAxiosRequestConfig, data: unknown) => ({ config, data, status: 200, statusText: 'OK', headers: {} })

beforeEach(() => {
  vi.stubEnv('VITE_AUTH_MODE', 'http-only')
  vi.stubEnv('VITE_SESSION_REFRESH_URL', 'https://api.example.test/session/refresh')
  vi.stubEnv('VITE_SESSION_LOGOUT_URL', 'https://api.example.test/session/logout')
  clearSession()
  axios.defaults.adapter = adapter
})
afterEach(() => { store.dispatch(logout()); axios.defaults.adapter = originalAdapter; vi.unstubAllEnvs() })

test('concurrent refresh calls share one credentialed request without a refresh-token body', async () => {
  adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => response(config, session))
  await Promise.all([refreshSession(), refreshSession()])
  expect(adapter).toHaveBeenCalledTimes(1)
  const [config] = adapter.mock.calls[0]
  expect(config.withCredentials).toBe(true)
  expect(config.headers.get('X-CSRF-Protection')).toBe('1')
  expect(JSON.parse(config.data)).toEqual({})
  expect(getAccessToken()).toBe('access')
  expect(localStorage.length).toBe(0)
  expect(store.getState().user.user?.email).toBe('user@example.test')
})

test('a refresh finishing after logout cannot restore the old session', async () => {
  let finish!: (value: ReturnType<typeof response>) => void
  let requestConfig!: InternalAxiosRequestConfig
  adapter.mockImplementation((config: InternalAxiosRequestConfig) => {
    requestConfig = config
    return new Promise(resolve => { finish = resolve })
  })
  const waiting = refreshSession()
  const rejection = expect(waiting).rejects.toThrow('Session changed')
  await vi.waitFor(() => expect(finish).toBeTypeOf('function'))
  store.dispatch(logout())
  finish(response(requestConfig, session))
  await rejection
  expect(getAccessToken()).toBeUndefined()
  expect(store.getState().user.user).toBeUndefined()
})

test('a response for an earlier account cannot overwrite a newer login', async () => {
  let finish!: (value: ReturnType<typeof response>) => void
  let requestConfig!: InternalAxiosRequestConfig
  adapter.mockImplementation((config: InternalAxiosRequestConfig) => {
    requestConfig = config
    return new Promise(resolve => { finish = resolve })
  })
  const waiting = refreshSession()
  const rejection = expect(waiting).rejects.toThrow('Session changed')
  await vi.waitFor(() => expect(finish).toBeTypeOf('function'))
  store.dispatch(login({ token: 'other-access', user: { ...session.user, id: '2' } }))
  finish(response(requestConfig, session))
  await rejection
  expect(getAccessToken()).toBe('other-access')
  expect(store.getState().user.user?.id).toBe('2')
})

test('refresh failures reject all waiters and clear the session', async () => {
  store.dispatch(login(session))
  adapter.mockRejectedValue(new Error('Refresh denied'))
  const results = await Promise.allSettled([refreshSession(), refreshSession()])
  expect(results.every(result => result.status === 'rejected')).toBe(true)
  expect(adapter).toHaveBeenCalledTimes(1)
  expect(getAccessToken()).toBeUndefined()
})

test('logout clears memory immediately, sends credentialed revocation and reports failure', async () => {
  store.dispatch(login(session))
  adapter.mockRejectedValue(new Error('Server unavailable'))
  const waiting = logoutSession()
  expect(getAccessToken()).toBeUndefined()
  expect(store.getState().user.user).toBeUndefined()
  await expect(waiting).rejects.toThrow('Server unavailable')
  const [config] = adapter.mock.calls[0]
  expect(config.url).toBe('https://api.example.test/session/logout')
  expect(config.withCredentials).toBe(true)
  expect(config.headers.get('X-CSRF-Protection')).toBe('1')
})
