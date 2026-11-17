# CRUD Monster · React

React + TypeScript starter with authentication, roles and CRUD administration.

## What is this project?

CRUD Monster React is a boilerplate: application source code that you copy and customize to build your own project. It includes authentication screens, protected routes, user and role administration, and reusable CRUD components. You own and maintain your copy; changes to this repository are not automatically applied to your application.

Vite is the development server and build tool inside the starter. It serves the app locally, updates the browser as you edit React components, and builds the production files for hosting. Vite alone creates a minimal React project; this starter adds the application features and API integration.

You obtain the starter from GitHub, then use Vite to develop and build your application. A dedicated `npm create crud-monster` generator is not currently provided.

## Getting started

If GitHub's **Use this template** button is available, use it to create your own repository without this project's commit history, then clone that repository. Otherwise, clone this repository into a directory named for your application:

Use Node.js 22.12+ or 24+:

```sh
git clone git@github.com:crud-monster/react.git my-app
cd my-app
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_HOST` in `.env` to a compatible GraphQL endpoint. Environment variables are included in the browser bundle; do not put secrets in them. Restart the development server after editing `.env`.

When cloning this repository directly, Git preserves its commit history and `origin` points to CRUD Monster. Before pushing your application, create your own empty GitHub repository and change the remote:

```sh
git remote set-url origin git@github.com:YOUR-ACCOUNT/YOUR-REPOSITORY.git
```

Customize the package name and repository metadata in `package.json`, replace the sample screens, and connect your backend. `npm run build` creates the static frontend in `dist/`; Vite does not provide the backend or host the production application.

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

Existing GraphQL operations still target the original backend contract, including `_v1` operations. Renaming to CRUD Monster does not migrate the backend. Legacy documentation links in the sample UI refer to that API.

## Included features

- Apollo GraphQL integration.
- Login, registration, email verification and password reset.
- Social login callbacks.
- Protected routes and user roles.
- User and role administration.
- Reusable CRUD list and editor components.

End-to-end verification of backend flows requires a compatible API and test accounts.
