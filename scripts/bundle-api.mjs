import { build } from 'esbuild'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = join(root, 'api')
const outfile = join(apiDir, 'index.js')

/**
 * Single bundled ESM serverless entry for Vite + Vercel.
 * Avoids catch-all filenames and extensionless multi-file ESM crashes.
 */
await mkdir(apiDir, { recursive: true })

for (const name of [
  'index.ts',
  'index.js',
  '[...path].ts',
  '[...path].js',
  '[[...route]].ts',
  '.gitignore',
]) {
  await rm(join(apiDir, name), { force: true })
}

await build({
  absWorkingDir: root,
  entryPoints: [join(root, 'server/vercel-entry.ts')],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  // Bundle JS deps; leave native/heavy DB drivers external.
  external: ['pg', 'pg-native', '@electric-sql/pglite'],
  logLevel: 'info',
})

console.log('bundle-api: wrote', outfile)
