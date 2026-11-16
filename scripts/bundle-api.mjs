import { mkdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'lib')
const outfile = join(outDir, 'zenna-api.js')
const entry = join(root, 'server/app.ts')

/**
 * Emit a small ESM file of our server code only (npm deps stay external).
 * Uses npx esbuild so esbuild does not need to be a package.json dependency
 * (adding it has broken this project’s Vercel deploys).
 */
await mkdir(outDir, { recursive: true })
await rm(outfile, { force: true })

const result = spawnSync(
  'npx',
  [
    '--yes',
    'esbuild@0.25.12',
    entry,
    '--bundle',
    '--platform=node',
    '--format=esm',
    '--target=node20',
    '--packages=external',
    `--outfile=${outfile}`,
  ],
  { cwd: root, stdio: 'inherit', shell: false },
)

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log('bundle-api: wrote', outfile)
