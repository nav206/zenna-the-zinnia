import { createHash, randomBytes } from 'node:crypto'
import { sql } from './db'

const RESET_TTL_MS = 1000 * 60 * 60 // 1 hour

export function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function mintResetToken() {
  return randomBytes(32).toString('base64url')
}

export async function createPasswordReset(userId: string) {
  const token = mintResetToken()
  const tokenHash = hashResetToken(token)
  const id = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString()

  // Invalidate older unused tokens for this user.
  await sql(
    `update password_reset_tokens
     set used_at = now()
     where user_id = $1 and used_at is null`,
    [userId],
  )

  await sql(
    `insert into password_reset_tokens (id, user_id, token_hash, expires_at)
     values ($1, $2, $3, $4)`,
    [id, userId, tokenHash, expiresAt],
  )

  return { token, expiresAt }
}

export async function consumePasswordReset(token: string) {
  const tokenHash = hashResetToken(token)
  const rows = await sql<{
    id: string
    user_id: string
    expires_at: string | Date
    used_at: string | Date | null
  }>(
    `select id, user_id, expires_at, used_at
     from password_reset_tokens
     where token_hash = $1`,
    [tokenHash],
  )
  const row = rows[0]
  if (!row || row.used_at) return null
  if (new Date(row.expires_at).getTime() < Date.now()) return null

  await sql(
    `update password_reset_tokens set used_at = now() where id = $1`,
    [row.id],
  )
  return { userId: row.user_id }
}

export async function sendPasswordResetEmail(opts: {
  to: string
  resetUrl: string
}) {
  const key = process.env.RESEND_API_KEY?.trim()
  const from =
    process.env.RESET_EMAIL_FROM?.trim() || 'Zenna <onboarding@resend.dev>'
  if (!key) {
    console.info('[password-reset] RESEND_API_KEY unset; link:', opts.resetUrl)
    return false
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: 'Reset your Zenna garden password',
      text: `Reset your password here (expires in 1 hour):\n\n${opts.resetUrl}\n\nIf you did not ask for this, you can ignore the email.`,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[password-reset] Resend failed', res.status, detail)
    return false
  }
  return true
}

export function allowDevResetLinks() {
  if (process.env.ALLOW_DEV_RESET_LINKS === '1') return true
  if (process.env.VERCEL_ENV === 'production') return false
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
    return false
  }
  return !process.env.RESEND_API_KEY?.trim()
}
