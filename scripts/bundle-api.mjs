import { build } from 'esbuild'
import { mkdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'lib')
const outfile = join(outDir, 'zenna-api.js')

/**
 * Emit a small ESM file of *our* server code only (npm deps stay external).
 * Kept outside /api so Vercel deploy analysis stays on thin api/*.ts entries.
 */
await mkdir(outDir, { recursive: true })
await rm(outfile, { force: true })

await build({
  absWorkingDir: root,
  entryPoints: [join(root, 'server/app.ts')],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  logLevel: 'info',
})

console.log('bundle-api: wrote', outfile)
