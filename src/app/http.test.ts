import { vi } from 'vitest'
import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { refreshToken } from './refreshToken'
import { uploadFile } from './utils'
import { clearSession, saveSession } from './session/storage'

const originalAdapter = axios.defaults.adapter
const adapter = vi.fn()

beforeEach(() => {
  adapter.mockImplementation(async (config: InternalAxiosRequestConfig) => ({
    data: { uploaded: true }, status: 200, statusText: 'OK', headers: {}, config,
  }))
  axios.defaults.adapter = adapter
  vi.stubEnv('VITE_HOST', 'https://api.example.test/graphql')
  localStorage.setItem('user.id', 'user-1')
  localStorage.setItem('user.token', 'access-token')
  localStorage.setItem('user.refreshToken', 'refresh-token')
})

afterEach(() => {
  axios.defaults.adapter = originalAdapter
  vi.unstubAllEnvs()
  clearSession()
})

test('Axios serializes the refresh-token GraphQL request as JSON', async () => {
  await refreshToken()
  const [config] = adapter.mock.calls[0]

  expect(config.url).toBe('https://api.example.test/graphql')
  expect(config.method).toBe('post')
  expect(config.headers.get('Content-Type')).toBe('application/json')
  expect(JSON.parse(config.data)).toMatchObject({
    variables: { userId: 'user-1', token: 'access-token', refreshToken: 'refresh-token' },
  })
})

test('Axios preserves FormData and bearer authorization for uploads', async () => {
  const file = new File(['example'], 'example.txt', { type: 'text/plain' })
  const callback = vi.fn()

  await expect(uploadFile()(file, callback)).resolves.toEqual({ uploaded: true })
  const [config] = adapter.mock.calls[0]

  expect(config.url).toBe('https://api.example.test/upload')
  expect(config.headers.get('Authorization')).toBe('Bearer access-token')
  expect(config.data).toBeInstanceOf(FormData)
  expect(config.data.get('file')).toEqual(file)
  expect(callback).toHaveBeenCalledWith(null, { uploaded: true })
})

test('upload failures expose the backend message through the promise and callback', async () => {
  const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST')
  error.response = {
    data: { error: { message: 'Upload denied' } }, status: 403,
    statusText: 'Forbidden', headers: {}, config: { headers: {} } as InternalAxiosRequestConfig,
  }
  adapter.mockRejectedValueOnce(error)
  const callback = vi.fn()

  await expect(uploadFile()(new File(['example'], 'example.txt'), callback)).rejects.toThrow('Upload denied')
  expect(callback).toHaveBeenCalledWith(expect.objectContaining({ message: 'Upload denied' }), null)
})

test('cookie-mode uploads use the memory access token, credentials and the CSRF guard header', async () => {
  vi.stubEnv('VITE_AUTH_MODE', 'http-only')
  vi.stubEnv('VITE_SESSION_REFRESH_URL', 'https://api.example.test/session/refresh')
  vi.stubEnv('VITE_SESSION_LOGOUT_URL', 'https://api.example.test/session/logout')
  saveSession({ token: 'memory-access', user: { id: '1', email: 'user@example.test', verified: true, roles: [] } })
  await uploadFile()(new File(['example'], 'example.txt'))
  const [config] = adapter.mock.calls[0]
  expect(config.withCredentials).toBe(true)
  expect(config.headers.get('Authorization')).toBe('Bearer memory-access')
  expect(config.headers.get('X-CSRF-Protection')).toBe('1')
  expect(localStorage.getItem('user.token')).toBeNull()
  expect(localStorage.getItem('user.refreshToken')).toBeNull()
})
