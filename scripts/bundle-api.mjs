import { build } from 'esbuild'
import { copyFile, mkdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = join(root, 'api')
const outfile = join(apiDir, 'index.js')
const catchAll = join(apiDir, '[...path].js')

/**
 * Single ESM serverless bundle for Vite + Vercel (package.json "type": "module").
 * Stub PGlite to keep the function lean; Neon DATABASE_URL is used in production.
 * Emit both index.js and [...path].js so /api and /api/* resolve without rewrites.
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
  external: ['pg', 'pg-native'],
  logLevel: 'info',
  plugins: [
    {
      name: 'stub-pglite',
      setup(b) {
        b.onResolve({ filter: /^@electric-sql\/pglite$/ }, () => ({
          path: 'pglite-stub',
          namespace: 'stub',
        }))
        b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
          contents: `
            export class PGlite {
              constructor() {
                throw new Error(
                  'PGlite is not bundled for Vercel. Set DATABASE_URL (Neon).',
                )
              }
            }
          `,
          loader: 'js',
        }))
      },
    },
  ],
})

await copyFile(outfile, catchAll)
console.log('bundle-api: wrote', outfile, 'and', catchAll)
