import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import pg from 'pg'

export type SqlRow = Record<string, unknown>

const databaseUrl = process.env.DATABASE_URL?.trim() ?? ''
let pool: pg.Pool | undefined
let local: Promise<PGlite> | undefined

export function usingRemoteDb() {
  return databaseUrl !== ''
}

export async function sql<T extends SqlRow = SqlRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== '') {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 })
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

async function startLocal(): Promise<PGlite> {
  const db = new PGlite()
  const dir = join(process.cwd(), 'migrations')
  const files = (await readdir(dir).catch(() => []))
    .filter((f) => f.endsWith('.sql'))
    .sort()
  for (const file of files) {
    await db.exec(await readFile(join(dir, file), 'utf8'))
  }
  return db
}
