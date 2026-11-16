import { compare, hash } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import type { Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

const COOKIE = 'zenna_session'
const DEV_SECRET = 'zenna-local-dev-only-not-for-production'

export type SessionUser = {
  id: string
  email: string
  displayName: string
}

function sessionSecret(): Uint8Array | null {
  const fromEnv = process.env.SESSION_SECRET?.trim()
  if (fromEnv && fromEnv.length >= 16) {
    return new TextEncoder().encode(fromEnv)
  }
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    if (process.env.DATABASE_URL?.trim()) {
      return null
    }
  }
  return new TextEncoder().encode(DEV_SECRET)
}

export function authConfigured() {
  return sessionSecret() !== null
}

export async function hashPassword(password: string) {
  return hash(password, 10)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash)
}

export async function createSessionToken(user: SessionUser) {
  const secret = sessionSecret()
  if (!secret) throw new Error('SESSION_SECRET is not configured')
  return new SignJWT({
    email: user.email,
    displayName: user.displayName,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}

export async function readSession(c: Context): Promise<SessionUser | null> {
  const secret = sessionSecret()
  if (!secret) return null
  const token = getCookie(c, COOKIE)
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    const id = payload.sub
    const email = payload.email
    const displayName = payload.displayName
    if (
      typeof id !== 'string' ||
      typeof email !== 'string' ||
      typeof displayName !== 'string'
    ) {
      return null
    }
    return { id, email, displayName }
  } catch {
    return null
  }
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    secure: process.env.VERCEL === '1' || process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, COOKIE, { path: '/' })
}
