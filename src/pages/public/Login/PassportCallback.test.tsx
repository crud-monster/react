import React from 'react'
import axios from 'axios'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import userReducer from '../../../app/reducers/userSlice'
import PassportCallback from './PassportCallback'

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); localStorage.clear() })

test('OAuth reads the code regardless of parameter order and exchanges it once in Strict Mode', async () => {
  vi.stubEnv('VITE_HOST', 'https://api.example.test/graphql')
  const session = { token: 'token', refreshToken: 'refresh', user: { id: '1', email: 'user@example.test', verified: true, roles: [] } }
  const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: session })
  const store = configureStore({ reducer: { user: userReducer } })
  render(<React.StrictMode><Provider store={store}>
    <MemoryRouter initialEntries={['/login/github?state=example&code=a%2Bb%26c']}>
      <Routes>
        <Route path="/login/github" element={<PassportCallback type="github" />} />
        <Route path="/user/dashboard" element={<h1>Dashboard</h1>} />
      </Routes>
    </MemoryRouter>
  </Provider></React.StrictMode>)

  expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  expect(get).toHaveBeenCalledTimes(1)
  expect(get).toHaveBeenCalledWith('https://api.example.test/auth/github/callback?code=a%2Bb%26c&state=example', expect.objectContaining({ timeout: 15000 }))
  expect(store.getState().user.user?.token).toBe('token')
})
