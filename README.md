# CRUD Monster · React

React + TypeScript starter with authentication, roles and CRUD administration.

## Getting started

Use Node.js 22.12+ or 24+:

```sh
git clone git@github.com:crud-monster/react.git
cd react
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_HOST` in `.env` to a compatible GraphQL endpoint. Environment variables are included in the browser bundle; do not put secrets in them. Restart the development server after editing `.env`.

## Commands

- `npm run dev` (or `npm start`): start the Vite development server.
- `npm run typecheck`: check TypeScript types.
- `npm test`: run tests once with Vitest.
- `npm run test:watch`: run tests in watch mode.
- `npm run build`: create the production bundle in `dist/`.
- `npm run preview` (or `npm run serve`): preview the production bundle.

Source code lives in `src/`, static assets in `public/`, and dependencies and commands in the root `package.json`. This is a standalone application, not a CRA template package.

For deployment under a subpath, set `VITE_BASE_PATH=/my-app/` in `.env` before building; Vite and the router share this base path. Hosting must serve `index.html` for client routes. A GitHub Pages fallback is included; adjust `pathSegmentsToKeep` in `public/404.html` for the deployment path.

## Migration status

This stage uses React 18 with the createRoot API and Strict Mode, Vite, TypeScript 5.9 and Vitest. GraphQL files are imported directly, including their fragment dependencies.

When migrating a local environment file, rename `REACT_APP_HOST` to `VITE_HOST`, `REACT_APP_BASENAME` to `VITE_BASE_PATH` and `REACT_APP_DEFAULT_USER_PATH` to `VITE_DEFAULT_USER_PATH`. Replace deployment references to `build/` with `dist/`. The unused CRA service-worker helper has been removed.

Axios uses the 1.x release line. Redux Toolkit 2.2.x and React Redux 9.1.x are retained from the preceding dependency update; upgrading them further is a separate change.

Apollo Client 4 uses the React entry point `@apollo/client/react` and GraphQL 16. Expired sessions share one token refresh across concurrent requests. A failed refresh clears the session and rejects waiting requests. Network retries are limited to three attempts for queries; mutations and HTTP 4xx failures are not automatically retried.

Existing GraphQL operations still target the original backend contract, including `_v1` operations. Renaming to CRUD Monster does not migrate the backend. Legacy documentation links in the sample UI refer to that API.

## Included features

- Apollo GraphQL integration.
- Login, registration, email verification and password reset.
- Social login callbacks.
- Protected routes and user roles.
- User and role administration.
- Reusable CRUD list and editor components.

End-to-end verification of backend flows requires a compatible API and test accounts.
