import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import pg from 'pg'

export type SqlRow = Record<string, unknown>

type LocalDb = {
  query: <T>(text: string, params?: unknown[]) => Promise<{ rows: T[] }>
  exec: (sql: string) => Promise<unknown>
}

const databaseUrl = process.env.DATABASE_URL?.trim() ?? ''
let pool: pg.Pool | undefined
let local: Promise<LocalDb> | undefined

export function usingRemoteDb() {
  return databaseUrl !== ''
}

export async function sql<T extends SqlRow = SqlRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== '') {
    pool ??= new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
      ssl:
        process.env.PGSSLMODE === 'disable'
          ? undefined
          : { rejectUnauthorized: false },
    })
    return (await pool.query(text, params)).rows as T[]
  }
  local ??= startLocal().catch((error: unknown) => {
    local = undefined
    throw error
  })
  const db = await local
  const result = await db.query<T>(text, params)
  return result.rows
}

async function startLocal(): Promise<LocalDb> {
  // Lazy-load so production serverless bundles never pull in PGlite/WASM.
  const spec = '@electric-sql/' + 'pglite'
  const { PGlite } = await import(/* @vite-ignore */ spec)
  const db = new PGlite()
  const dir = join(process.cwd(), 'migrations')
  const files = (await readdir(dir).catch(() => []))
    .filter((f) => f.endsWith('.sql'))
    .sort()
  for (const file of files) {
    await db.exec(await readFile(join(dir, file), 'utf8'))
  }
  return db as unknown as LocalDb
}
