import { readdir, readFile } from 'node:fs/promises'
import pg from 'pg'

const url = process.env.DATABASE_URL?.trim() ?? ''
const files = (await readdir('migrations').catch(() => []))
  .filter((f) => f.endsWith('.sql'))
  .sort()

if (url === '' || files.length === 0) {
  console.log('migrate: nothing to do (no DATABASE_URL or no migrations)')
  process.exit(0)
}

const connectionString = process.env.DATABASE_URL_UNPOOLED?.trim() || url

try {
  const client = new pg.Client({
    connectionString,
    ssl:
      process.env.PGSSLMODE === 'disable'
        ? undefined
        : { rejectUnauthorized: false },
  })
  await client.connect()
  try {
    await client.query("set lock_timeout = '60s'")
    await client.query('select pg_advisory_lock(7272741)')
    await client.query(`
      create table if not exists schema_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      )
    `)
    const done = new Set(
      (await client.query('select name from schema_migrations')).rows.map(
        (r) => r.name,
      ),
    )
    for (const file of files.filter((f) => !done.has(f))) {
      await client.query('begin')
      try {
        await client.query(await readFile(`migrations/${file}`, 'utf8'))
        await client.query('insert into schema_migrations (name) values ($1)', [
          file,
        ])
        await client.query('commit')
        console.log(`migrate: applied ${file}`)
      } catch (error) {
        await client.query('rollback')
        throw error
      }
    }
    console.log('migrate: ok')
  } finally {
    await client.end()
  }
} catch (error) {
  console.error('migrate: failed (continuing build):', error)
  process.exit(0)
}
