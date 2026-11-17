# Preparing HttpOnly sessions

This branch prepares the frontend for cookie-based refresh credentials. It does **not** implement a backend, issue HttpOnly cookies, or make the legacy API cookie-safe. The default remains `VITE_AUTH_MODE=legacy`, which still stores credentials in localStorage.

## Frontend modes

| Mode | Access token | Refresh token | Session restoration |
| --- | --- | --- | --- |
| `legacy` (default) | localStorage | localStorage | Existing `_v1` GraphQL refresh mutation |
| `http-only` | JavaScript memory only | Backend-managed HttpOnly cookie | Credentialed POST to the configured refresh endpoint |

The session module owns token access and persistence. Cookie mode removes legacy session keys and never reads refresh cookies or falls back to localStorage. Redux contains the current user and access token in memory; no Redux persistence is configured. Authentication GraphQL documents omit the `refreshToken` field in this mode. Login, registration, password reset/change and OAuth responses must therefore provide `token` and `user` without a readable refresh credential.

## Backend contract to implement before enabling the mode

Endpoint names below are examples, not existing routes. Configure the actual backend URLs:

```dotenv
VITE_AUTH_MODE=http-only
VITE_HOST=https://api.example.com/graphql
VITE_SESSION_REFRESH_URL=https://api.example.com/auth/session/refresh
VITE_SESSION_LOGOUT_URL=https://api.example.com/auth/session/logout
```

The frontend requires HTTPS for the session endpoints, with HTTP allowed only on loopback for local development. Both endpoint variables are required for the complete login/logout flow. An unavailable or misconfigured cookie endpoint never invokes the legacy refresh mutation.

### Login and authentication mutations

Keep the existing operation names and `token`/`user` result fields. The server must set or rotate the refresh cookie on successful login, registration, password reset/change and OAuth exchange. Cookie mode does not request `refreshToken` in GraphQL; the server must not return refresh credentials in any JSON response. Invalid credentials must produce GraphQL errors or an appropriate HTTP error, not a success-shaped empty result.

Example production cookie:

```http
Set-Cookie: __Host-crud_refresh=<opaque-value>; Path=/; HttpOnly; Secure; SameSite=Lax
Cache-Control: no-store
```

Do not set `Domain` for a `__Host-` cookie. Set an explicit lifetime appropriate to the session policy. If frontend and API are cross-site, assess `SameSite=None; Secure` and browser third-party-cookie restrictions; a same-site API or backend-for-frontend is generally simpler. Cookie flags and deployment topology must be verified on the actual backend.

### Restore and refresh

The frontend sends `POST VITE_SESSION_REFRESH_URL` with JSON `{}`, credentials enabled, and `X-CSRF-Protection: 1`. There is no user ID or refresh credential in the body.

Successful response:

```json
{
  "token": "short-lived-access-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "verified": true,
    "roles": [{ "name": "user" }]
  }
}
```

Determine identity from the cookie on the server, rotate the refresh credential atomically, return the current authoritative profile and roles, and detect reuse. Return `401` for no valid session and expire an invalid cookie. Network requests time out after 15 seconds. Multiple requests in one frontend instance share one refresh; cross-tab rotation races must be handled by the backend's session design.

At startup, protected screens wait for restoration. A `401` becomes an anonymous session. Other failures are shown to the user; they never restore legacy tokens. Refresh responses arriving after logout or a newer login are rejected. Responses started for a previous session are prevented from repopulating Apollo's cache.

### Logout

`POST VITE_SESSION_LOGOUT_URL` receives `{}`, credentials and the CSRF header. Revoke the entire refresh-token family/session and expire its cookie with the same name/path/domain attributes; return `204` on success. Logout should be idempotent, including when an older family member was rotated concurrently.

The frontend clears memory and cache immediately and reports failed server revocation with a retry action. It cannot delete an HttpOnly cookie itself. If revocation fails, that cookie may still restore a session on a later visit: frontend-only clearing is not proof of server logout. The backend must handle refresh/logout races so a late refresh cannot revive a revoked session.

### CSRF, CORS and OAuth

In cookie mode GraphQL, refresh, logout, upload and OAuth exchange requests include credentials and `X-CSRF-Protection: 1`. **This header alone is not automatic CSRF protection:** the backend must require it, validate `Origin` against an exact allowlist, and reject credentialed cross-origin requests from other origins. Configure `Access-Control-Allow-Credentials: true`, the exact allowed frontend origin (never `*`), and the required headers/methods. If the backend requires a synchronizer/double-submit CSRF token, integrate that mechanism instead; it is not provided by this draft adapter.

The OAuth exchange forwards `state` when present. The backend must verify the state/session binding, use PKCE where applicable, validate the provider and redirect target, and make authorization codes single-use. Forwarding `state` is not equivalent to validating it.

The regular API must validate access-token expiry, issuer/audience/signature as applicable and all resource/role permissions server-side. UI roles never authorize backend access. Do not log auth payloads, tokens, cookies or authorization headers.

## Verification before production

Use the existing legacy backend to confirm the default mode still works. For cookie mode, implement the contract and test login, reload, expiration, concurrent refresh, revoked sessions, logout/retry and OAuth using real cookies and the production CORS/SameSite topology. Test cross-tab refresh/logout separately. The included unit and mocked browser checks cannot certify a real backend's cookie flags or revocation.

HttpOnly prevents JavaScript from reading the refresh cookie; it does not prevent XSS from acting through the current page or reading the in-memory access token. Continue to prevent XSS and deploy suitable CSP and other HTTP security headers.

References: [OWASP HTML5 storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [OWASP OAuth security](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html).
