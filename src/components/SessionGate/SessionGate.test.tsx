import React from 'react'
import { act, render, screen } from '@testing-library/react'
import axios from 'axios'
import { vi } from 'vitest'
import { refreshSession } from '../../app/session/lifecycle'
import SessionGate from './SessionGate'

vi.mock('../../app/session/lifecycle', () => ({ refreshSession: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())

test('legacy mode renders immediately without probing cookie endpoints', () => {
  vi.stubEnv('VITE_AUTH_MODE', 'legacy')
  render(<SessionGate><h1>Application</h1></SessionGate>)
  expect(screen.getByRole('heading', { name: 'Application' })).toBeInTheDocument()
  expect(refreshSession).not.toHaveBeenCalled()
})

test('cookie mode waits for restoration before rendering route guards', async () => {
  vi.stubEnv('VITE_AUTH_MODE', 'http-only')
  let resolve!: () => void
  vi.mocked(refreshSession).mockImplementationOnce(() => new Promise(done => { resolve = () => done({ token: 'token', user: { id: '1', email: 'user@example.test', verified: true, roles: [] } }) }))
  render(<SessionGate><h1>Application</h1></SessionGate>)
  expect(screen.getByRole('status')).toHaveTextContent('Restoring your session')
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  await act(async () => resolve())
  expect(await screen.findByRole('heading', { name: 'Application' })).toBeInTheDocument()
})

test('a 401 restoration response allows an anonymous login without showing a failure', async () => {
  vi.stubEnv('VITE_AUTH_MODE', 'http-only')
  const error = new axios.AxiosError('No session')
  error.response = { status: 401 } as typeof error.response
  vi.mocked(refreshSession).mockRejectedValueOnce(error)
  render(<SessionGate><h1>Login</h1></SessionGate>)
  expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('other restoration failures are visible and never prevent access to the login screen', async () => {
  vi.stubEnv('VITE_AUTH_MODE', 'http-only')
  vi.mocked(refreshSession).mockRejectedValueOnce(new Error('Server unavailable'))
  render(<SessionGate><h1>Login</h1></SessionGate>)
  expect(await screen.findByRole('alert')).toHaveTextContent('could not be restored')
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
})
