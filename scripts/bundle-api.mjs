import { build } from 'esbuild'
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = join(root, 'api')
const outfile = join(apiDir, 'index.js')
const catchAll = join(apiDir, '[...path].js')

/**
 * Bundle the Hono app into a single ESM file so Vercel Node
 * does not crash on extensionless relative TypeScript imports.
 */
await mkdir(apiDir, { recursive: true })

// Remove prior TS handlers / stale bundles so only bundled JS is deployed.
for (const name of ['index.ts', '[...path].ts', 'index.js', '[...path].js']) {
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
  packages: 'external',
  logLevel: 'info',
})

await copyFile(outfile, catchAll)

// Tiny stub so local tooling that expects a TS entry still sees the folder.
await writeFile(
  join(apiDir, '.gitignore'),
  ['index.js', '[...path].js', ''].join('\n'),
)

console.log('bundle-api: wrote api/index.js and api/[...path].js')
