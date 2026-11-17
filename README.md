# CRUD Monster · React

React + TypeScript starter with authentication, roles and CRUD administration.

Repository: [crud-monster/react](https://github.com/crud-monster/react).

```sh
git clone git@github.com:crud-monster/react.git
cd react
```

## Project status

This project continues the original GraphQL Monster CRA template under the CRUD Monster name. The application source currently lives in `template/src`, static assets in `template/public`, and template dependencies in `template.json`.

Conversion to a standalone application and the React 18 upgrade will be delivered separately. Cloning this repository currently gives you the legacy template source, not a standalone runnable application.

The branding change preserves existing dependencies, build commands and GraphQL operations. The backend still needs to implement the existing GraphQL Monster contract, including `_v1` operations. Links in the sample UI refer to documentation for that contract.

## Included features

- Apollo GraphQL integration.
- Login, registration, email verification and password reset.
- Social login callbacks.
- Protected routes and user roles.
- User and role administration.
- Reusable CRUD list and editor components.
