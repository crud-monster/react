# create-crud-monster

Create a CRUD Monster React + TypeScript application with Vite, authentication screens, protected routes, and user/role administration. Requires Node.js 22.12+.

## Usage after publication

```sh
npm create crud-monster@latest my-app
cd my-app
npm ci
# Set VITE_HOST in .env to your compatible GraphQL endpoint.
npm run dev
```

Use `-- --template react` to select the React template explicitly. Run with `-- --help` for usage. The destination directory must not already exist; existing files are never overwritten.

The template is bundled in the npm package. Scaffolding does not need Git or a separate template download, does not install dependencies, and does not initialize a Git repository. Each generator release contains a snapshot of the starter. It creates `.env` from `.env.example`, changes the package name and lockfile, and removes upstream repository metadata.

The generated frontend requires a backend implementing the existing `_v1` GraphQL operations. Vite builds the frontend; it does not provide the backend or production hosting.

## Development and release

From the repository root:

```sh
npm run test:generator
npm run pack:generator
```

`prepack` builds the bundled template from an explicit file allowlist in this repository. Local `.env` files, Git history, dependencies, build output and the generator's own source are not copied into generated applications. The template is rebuilt for each package release; it is not downloaded from a moving Git branch at runtime.

Before the first npm publication, test the local tarball instead of the public command:

```sh
npm exec --yes --package=./create-crud-monster-0.1.0.tgz -- create-crud-monster my-app
```

To publish a reviewed release, authenticate to npm, verify package-name ownership and run `npm publish ./create-crud-monster-0.1.0.tgz --access public` from the repository root. npm authentication and publication are separate from creating the package; until publication, `npm create crud-monster@latest` is unavailable.
