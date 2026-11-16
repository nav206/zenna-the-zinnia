/**
 * Pure Node (req, res) health probe — no Web Response, no Hono, no DB.
 * Vercel Node invokes (req, res); returning Response leaves res open → 504.
 */
export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
}

type NodeRes = {
  statusCode: number
  setHeader: (name: string, value: string) => void
  end: (body?: string) => void
}

export default function handler(
  _req: unknown,
  res: NodeRes,
): void {
  const db = Boolean(process.env.DATABASE_URL?.trim())
  const secret = process.env.SESSION_SECRET?.trim() ?? ''
  const body = JSON.stringify({
    ok: true,
    db: db ? 'postgres' : 'pglite',
    auth: secret.length >= 16,
    probe: 'api/health.ts',
  })
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(body)
}
