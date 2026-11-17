# CRUD Monster · React

React + TypeScript starter with authentication, roles and CRUD administration.

## Getting started

Use Node.js 22 or newer:

```sh
git clone git@github.com:crud-monster/react.git
cd react
npm ci
cp .env.example .env
npm start
```

Set `REACT_APP_HOST` in `.env` to a compatible GraphQL endpoint. Environment variables are included in the browser bundle; do not put secrets in them. Restart the development server after editing `.env`.

## Commands

- `npm start`: start the development server.
- `npm run typecheck`: check TypeScript types.
- `npm test -- --watchAll=false`: run tests once.
- `npm run build`: create the production bundle in `build/`.
- `npm run serve`: preview the production bundle.

Source code lives in `src/`, static assets in `public/`, and dependencies and commands in the root `package.json`. This is a standalone application, not a CRA template package.

For deployment under a subpath, configure both `PUBLIC_URL` and `REACT_APP_BASENAME`. Hosting must serve `index.html` for client routes. A GitHub Pages fallback is included; adjust `pathSegmentsToKeep` in `public/404.html` for the deployment path.

## Migration status

This stage uses React 18 with the createRoot API and Strict Mode, CRA 5 and TypeScript 4.9. Migration to Vite will be delivered separately.

Existing GraphQL operations still target the original backend contract, including `_v1` operations. Renaming to CRUD Monster does not migrate the backend. Legacy documentation links in the sample UI refer to that API.

## Included features

- Apollo GraphQL integration.
- Login, registration, email verification and password reset.
- Social login callbacks.
- Protected routes and user roles.
- User and role administration.
- Reusable CRUD list and editor components.

End-to-end verification of backend flows requires a compatible API and test accounts.
