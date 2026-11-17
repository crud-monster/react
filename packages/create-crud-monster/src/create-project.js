import { cp, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const bundledTemplate = fileURLToPath(new URL('../template/', import.meta.url))

export function packageNameFor(directory) {
  const name = basename(directory)
  if (name.length > 214 || !/^[a-z0-9][a-z0-9._-]*$/.test(name) || ['node_modules', 'favicon.ico'].includes(name)) {
    throw new Error('Use a lowercase project name containing letters, numbers, dots, underscores or hyphens.')
  }
  return name
}

export async function createProject(directory, { cwd = process.cwd(), template = bundledTemplate } = {}) {
  const target = resolve(cwd, directory)
  const name = packageNameFor(target)
  try {
    await lstat(target)
    throw new Error(`Destination already exists: ${target}. Choose a new directory.`)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  // Prepare everything beside the destination before claiming it. Never overwrite existing files.
  await mkdir(dirname(target), { recursive: true })
  const staging = await mkdtemp(join(dirname(target), '.crud-monster-'))
  try {
    await cp(template, staging, { recursive: true })
    await rename(join(staging, '_gitignore'), join(staging, '.gitignore'))
    await rename(join(staging, '_env.example'), join(staging, '.env.example'))
    await cp(join(staging, '.env.example'), join(staging, '.env'))
    await rename(join(staging, '_package-lock.json'), join(staging, 'package-lock.json'))

    const manifest = JSON.parse(await readFile(join(staging, 'package.json'), 'utf8'))
    manifest.name = name
    manifest.version = '0.1.0'
    manifest.private = true
    delete manifest.repository
    delete manifest.bugs
    delete manifest.homepage
    await writeFile(join(staging, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')

    const lock = JSON.parse(await readFile(join(staging, 'package-lock.json'), 'utf8'))
    lock.name = name
    lock.version = manifest.version
    lock.packages[''].name = name
    lock.packages[''].version = manifest.version
    await writeFile(join(staging, 'package-lock.json'), JSON.stringify(lock, null, 2) + '\n')
    await writeFile(join(staging, 'README.md'), `# ${name}\n\nCreated with CRUD Monster React.\n\n## Development\n\nRequires Node.js 22.12+. Set VITE_HOST in .env to your compatible GraphQL endpoint.\n\n\x60\x60\x60sh\nnpm ci\nnpm run dev\n\x60\x60\x60\n\nRun tests with npm test. Build with npm run build; deploy dist/ with an SPA fallback.\nEnvironment variables are included in the browser bundle; do not store secrets in them.\nThe frontend requires a backend implementing the existing _v1 GraphQL operations.\n\nBased on [CRUD Monster React](https://github.com/crud-monster/react).\n`)

    // mkdir is exclusive, including when another process creates the target during preparation.
    await mkdir(target)
    await cp(staging, target, { recursive: true, force: false, errorOnExist: true })
    return { target, name }
  } finally {
    await rm(staging, { recursive: true, force: true })
  }
}
