/**
 * Zero-dependency health probe.
 * Kept separate from the Hono app so cold-start / adapter issues
 * cannot turn /api/health into a 504.
 */
export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
}

export default function handler(_request: Request): Response {
  const db = Boolean(process.env.DATABASE_URL?.trim())
  const secret = process.env.SESSION_SECRET?.trim() ?? ''
  return Response.json({
    ok: true,
    db: db ? 'postgres' : 'pglite',
    auth: secret.length >= 16,
  })
}
