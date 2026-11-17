import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import userReducer from '../../app/reducers/userSlice'
import type { UserWithToken } from '../../app/reducers/userSlice'
import ProtectedRoute from './ProtectedRoute'

function LoginDestination() {
  const location = useLocation()
  return <div data-testid="destination">{location.pathname + location.search}</div>
}

function renderGuard(user?: UserWithToken, role?: string, basename = '/') {
  const store = configureStore({ reducer: { user: userReducer }, preloadedState: { user: { user, state: 'no-user' as const } } })
  render(<Provider store={store}>
    <MemoryRouter basename={basename} initialEntries={[`${basename === '/' ? '' : basename}/admin/users?sort=email#list`]}>
      <Routes>
        <Route path="/admin/users" element={<ProtectedRoute role={role}><h1>Private content</h1></ProtectedRoute>} />
        <Route path="/login" element={<LoginDestination />} />
      </Routes>
    </MemoryRouter>
  </Provider>)
}

test('anonymous visitors return to the full requested path after login', async () => {
  renderGuard()
  const destination = await screen.findByTestId('destination')
  const url = new URL(destination.textContent!, 'https://example.test')
  expect(url.pathname).toBe('/login')
  expect(url.searchParams.get('path')).toBe('/admin/users?sort=email#list')
  expect(screen.queryByRole('heading', { name: 'Private content' })).not.toBeInTheDocument()
})

test('a logged-in user without the required role cannot enter an admin route', async () => {
  renderGuard({ id: '1', email: 'user@example.test', verified: true, token: 'token', roles: [] }, 'admin')
  expect(new URL((await screen.findByTestId('destination')).textContent!, 'https://example.test').searchParams.get('role')).toBe('admin')
})

test('an authorized user can enter an admin route', () => {
  renderGuard({ id: '1', email: 'admin@example.test', verified: true, token: 'token', roles: [{ name: 'admin' }] }, 'admin')
  expect(screen.getByRole('heading', { name: 'Private content' })).toBeInTheDocument()
})

test('return paths remain relative to the configured deployment basename', async () => {
  renderGuard(undefined, undefined, '/starter')
  const destination = new URL((await screen.findByTestId('destination')).textContent!, 'https://example.test')
  expect(destination.searchParams.get('path')).toBe('/admin/users?sort=email#list')
})
