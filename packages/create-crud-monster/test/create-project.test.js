import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, mkdir, writeFile, readdir, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createProject } from '../src/create-project.js'

const cli = fileURLToPath(new URL('../bin/create-crud-monster.js', import.meta.url))

async function sandbox(t) {
  const cwd = await mkdtemp(join(tmpdir(), 'crud-monster-test-'))
  t.after(() => rm(cwd, { recursive: true, force: true }))
  return cwd
}

test('creates a standalone application with synchronized package metadata and example environment', async t => {
  const cwd = await sandbox(t)
  const { target } = await createProject('my-app', { cwd })
  const manifest = JSON.parse(await readFile(join(target, 'package.json'), 'utf8'))
  const lock = JSON.parse(await readFile(join(target, 'package-lock.json'), 'utf8'))
  assert.equal(manifest.name, 'my-app')
  assert.equal(manifest.version, '0.1.0')
  assert.equal(manifest.private, true)
  assert.equal(manifest.repository, undefined)
  assert.equal(manifest.bugs, undefined)
  assert.equal(manifest.scripts['test:generator'], undefined)
  assert.equal(lock.name, manifest.name)
  assert.equal(lock.version, manifest.version)
  assert.equal(lock.packages[''].name, manifest.name)
  assert.equal(lock.packages[''].version, manifest.version)
  assert.deepEqual(lock.packages[''].dependencies, manifest.dependencies)
  assert.deepEqual(lock.packages[''].devDependencies, manifest.devDependencies)
  assert.equal(await readFile(join(target, '.env'), 'utf8'), await readFile(join(target, '.env.example'), 'utf8'))
  assert.ok((await readFile(join(target, '.gitignore'), 'utf8')).includes('.env'))
  const entries = await readdir(target)
  for (const unwanted of ['.git', 'node_modules', 'dist', 'packages', '_gitignore', '_package-lock.json']) {
    assert.ok(!entries.includes(unwanted), unwanted)
  }
  assert.ok(entries.includes('src'))
  assert.ok(entries.includes('vite.config.ts'))
})

test('refuses an existing destination and leaves its contents untouched', async t => {
  const cwd = await sandbox(t)
  const target = join(cwd, 'my-app')
  await mkdir(target)
  await writeFile(join(target, 'keep.txt'), 'keep me')
  await assert.rejects(createProject('my-app', { cwd }), /already exists/)
  assert.equal(await readFile(join(target, 'keep.txt'), 'utf8'), 'keep me')
  assert.deepEqual(await readdir(target), ['keep.txt'])
})

test('refuses destination symlinks', async t => {
  const cwd = await sandbox(t)
  await mkdir(join(cwd, 'real'))
  await symlink(join(cwd, 'real'), join(cwd, 'linked'))
  await assert.rejects(createProject('linked', { cwd }), /already exists/)
  assert.deepEqual(await readdir(join(cwd, 'real')), [])
})

test('rejects invalid npm names before creating files', async t => {
  const cwd = await sandbox(t)
  for (const name of ['Bad Name', '-option', '.hidden', 'node_modules']) {
    await assert.rejects(createProject(name, { cwd }), /lowercase/)
  }
  assert.deepEqual(await readdir(cwd), [])
})

test('cleans staging files after a template failure', async t => {
  const cwd = await sandbox(t)
  await assert.rejects(createProject('my-app', { cwd, template: join(cwd, 'missing') }))
  assert.deepEqual(await readdir(cwd), [])
})

test('CLI handles help, version, invalid arguments and unsupported templates', async t => {
  const cwd = await sandbox(t)
  const run = args => spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' })
  assert.equal(run(['--help']).status, 0)
  assert.match(run(['--help']).stdout, /npm create crud-monster/)
  assert.equal(run(['--version']).stdout.trim(), '0.1.0')
  for (const args of [[], ['app', 'extra'], ['app', '--unknown'], ['app', '--template', 'vue']]) {
    assert.equal(run(args).status, 1)
  }
  assert.deepEqual(await readdir(cwd), [])
})

test('CLI creates an app from a path with spaces without installing or initializing Git', async t => {
  const cwd = await sandbox(t)
  const result = spawnSync(process.execPath, [cli, 'parent folder/my-app', '--template', 'react'], { cwd, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /npm ci/)
  const entries = await readdir(join(cwd, 'parent folder/my-app'))
  assert.ok(!entries.includes('node_modules'))
  assert.ok(!entries.includes('.git'))
})
