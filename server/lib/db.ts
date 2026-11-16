import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type pg from 'pg'

export type SqlRow = Record<string, unknown>

type LocalDb = {
  query: <T>(text: string, params?: unknown[]) => Promise<{ rows: T[] }>
  exec: (sql: string) => Promise<unknown>
}

const databaseUrl = process.env.DATABASE_URL?.trim() ?? ''
let pool: pg.Pool | undefined
let local: Promise<LocalDb> | undefined
let pgModule: Promise<typeof import('pg')> | undefined

export function usingRemoteDb() {
  return databaseUrl !== ''
}

async function getPg() {
  pgModule ??= import('pg')
  return pgModule
}

export async function sql<T extends SqlRow = SqlRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== '') {
    const pg = await getPg()
    pool ??= new pg.default.Pool({
      connectionString: databaseUrl,
      max: 1,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 5_000,
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
  // Keep the specifier split so bundlers/nft do not eagerly pack WASM.
  const scope = '@electric-sql'
  const name = 'pglite'
  const { PGlite } = await import(/* webpackIgnore: true */ `${scope}/${name}`)
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
