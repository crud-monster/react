#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { readFile } from 'node:fs/promises'
import { createProject } from '../src/create-project.js'

try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
      template: { type: 'string', default: 'react' },
    },
  })
  if (values.help) {
    console.log('Usage: npm create crud-monster@latest <project-directory> [-- --template react]\n\nCreates a React + TypeScript application. The destination must not already exist.\nRequires Node.js 22.12+. Dependencies are installed separately with npm ci.')
  } else if (values.version) {
    console.log(JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version)
  } else {
    if (values.template !== 'react') throw new Error('Only the react template is currently supported.')
    if (positionals.length !== 1 || !positionals[0].trim()) throw new Error('Specify one project directory. Run with --help for usage.')
    const { name, target } = await createProject(positionals[0])
    const quotedDirectory = "'" + positionals[0].replaceAll("'", "'\\''") + "'"
    console.log(`\nCreated ${name} in ${target}\n\nNext steps:\n  cd ${quotedDirectory}\n  npm ci\n  # Set VITE_HOST in .env\n  npm run dev\n`)
  }
} catch (error) {
  console.error(`create-crud-monster: ${error.message}`)
  process.exitCode = 1
}
