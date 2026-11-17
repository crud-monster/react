import { cp, copyFile, mkdir, rm, writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, join } from 'node:path'

const packageRoot = fileURLToPath(new URL('../', import.meta.url))
const repositoryRoot = resolve(packageRoot, '../..')
const template = join(packageRoot, 'template')

// An explicit allowlist keeps local credentials, build output and tooling out of releases.
const files = {
  src: 'src', public: 'public', 'index.html': 'index.html',
  'vite.config.ts': 'vite.config.ts', 'tsconfig.json': 'tsconfig.json',
  'package.json': 'package.json', 'package-lock.json': '_package-lock.json',
  '.gitignore': '_gitignore', '.env.example': '_env.example', LICENSE: 'LICENSE',
}

await rm(template, { recursive: true, force: true })
await mkdir(template, { recursive: true })
for (const [source, destination] of Object.entries(files)) {
  await cp(join(repositoryRoot, source), join(template, destination), { recursive: true })
}
await copyFile(join(repositoryRoot, 'LICENSE'), join(packageRoot, 'LICENSE'))

// Generator development commands are not part of the generated application.
const manifestPath = join(template, 'package.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
delete manifest.scripts['test:generator']
delete manifest.scripts['pack:generator']
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
