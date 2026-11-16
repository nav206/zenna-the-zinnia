import { sql } from './db'

const WINDOW_MS = 60 * 60 * 1000

export async function takeRateLimit(
  bucket: string,
  maxHits: number,
): Promise<{ ok: boolean; remaining: number }> {
  const rows = await sql<{
    hits: number
    window_start: string | Date
  }>('select hits, window_start from rate_limits where bucket = $1', [bucket])

  const now = Date.now()
  if (rows.length === 0) {
    await sql(
      'insert into rate_limits (bucket, hits, window_start) values ($1, 1, now())',
      [bucket],
    )
    return { ok: true, remaining: maxHits - 1 }
  }

  const row = rows[0]
  const start = new Date(row.window_start).getTime()
  if (Number.isNaN(start) || now - start > WINDOW_MS) {
    await sql(
      'update rate_limits set hits = 1, window_start = now() where bucket = $1',
      [bucket],
    )
    return { ok: true, remaining: maxHits - 1 }
  }

  if (row.hits >= maxHits) {
    return { ok: false, remaining: 0 }
  }

  await sql('update rate_limits set hits = hits + 1 where bucket = $1', [bucket])
  return { ok: true, remaining: maxHits - row.hits - 1 }
}

export function clientKey(c: {
  req: { header: (name: string) => string | undefined }
}): string {
  const forwarded = c.req.header('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return c.req.header('x-real-ip') || 'local'
}
