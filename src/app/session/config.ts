export function usesHttpOnlySession() {
  const mode = import.meta.env.VITE_AUTH_MODE || 'legacy'
  if (mode !== 'legacy' && mode !== 'http-only') throw new Error('VITE_AUTH_MODE must be legacy or http-only')
  return mode === 'http-only'
}

export function sessionEndpoint(action: 'refresh' | 'logout') {
  const value = action === 'refresh' ? import.meta.env.VITE_SESSION_REFRESH_URL : import.meta.env.VITE_SESSION_LOGOUT_URL
  if (!value) throw new Error(`Configure VITE_SESSION_${action.toUpperCase()}_URL before enabling HttpOnly sessions`)
  const url = new URL(value, window.location.origin)
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
    throw new Error('Cookie session endpoints require HTTPS (except local development)')
  }
  return url.href
}

// The backend must require this header and validate Origin with an exact allowlist.
// It is a CSRF preflight guard, not a secret token or a replacement for server checks.
export function sessionRequestOptions(): { withCredentials?: boolean; headers?: Record<string, string>; timeout: number } {
  if (!usesHttpOnlySession()) return { timeout: 15000 }
  sessionEndpoint('refresh')
  sessionEndpoint('logout')
  return { withCredentials: true, headers: { 'X-CSRF-Protection': '1' }, timeout: 15000 }
}
