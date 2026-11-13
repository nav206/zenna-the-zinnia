import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import {
  authConfigured,
  clearSessionCookie,
  createSessionToken,
  hashPassword,
  readSession,
  setSessionCookie,
  verifyPassword,
} from './lib/auth'
import { isCareAction } from './lib/careMath'
import { sql, usingRemoteDb } from './lib/db'
import {
  applyPlantCare,
  careTotals,
  getGlobalPlant,
  getPersonalPlant,
  signupCount,
} from './lib/plants'
import { clientKey, takeRateLimit } from './lib/rateLimit'

const signupSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  displayName: z.string().trim().min(2).max(40),
})

const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
})

const careSchema = z.object({
  action: z.string(),
  scope: z.enum(['global', 'personal']),
})

export const app = new Hono().basePath('/api')

app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    credentials: true,
  }),
)

app.get('/health', (c) =>
  c.json({
    ok: true,
    db: usingRemoteDb() ? 'postgres' : 'pglite',
    auth: authConfigured(),
  }),
)

app.get('/me', async (c) => {
  const user = await readSession(c)
  if (!user) return c.json({ user: null })
  const plant = await getPersonalPlant(user.id)
  return c.json({ user, plant })
})

app.post('/auth/signup', async (c) => {
  if (!authConfigured()) {
    return c.json(
      { error: 'Auth is not configured. Set SESSION_SECRET (16+ chars).' },
      503,
    )
  }
  const body = signupSchema.safeParse(await c.req.json().catch(() => null))
  if (!body.success) {
    return c.json({ error: 'Invalid signup details.' }, 400)
  }

  const limit = await takeRateLimit(`signup:${clientKey(c)}`, 8)
  if (!limit.ok) return c.json({ error: 'Too many signups from this network.' }, 429)

  const email = body.data.email.toLowerCase()
  const existing = await sql('select id from users where email = $1', [email])
  if (existing.length) {
    return c.json({ error: 'An account with that email already exists.' }, 409)
  }

  const passwordHash = await hashPassword(body.data.password)
  const id = crypto.randomUUID()
  const rows = await sql<{ id: string; email: string; display_name: string }>(
    `insert into users (id, email, password_hash, display_name)
     values ($1, $2, $3, $4)
     returning id, email, display_name`,
    [id, email, passwordHash, body.data.displayName],
  )
  const created = rows[0]
  await getPersonalPlant(created.id)
  const user = {
    id: created.id,
    email: created.email,
    displayName: created.display_name,
  }
  const token = await createSessionToken(user)
  setSessionCookie(c, token)
  const plant = await getPersonalPlant(user.id)
  const roots = await signupCount()
  return c.json({ user, plant, signupCount: roots }, 201)
})

app.post('/auth/login', async (c) => {
  if (!authConfigured()) {
    return c.json(
      { error: 'Auth is not configured. Set SESSION_SECRET (16+ chars).' },
      503,
    )
  }
  const body = loginSchema.safeParse(await c.req.json().catch(() => null))
  if (!body.success) return c.json({ error: 'Invalid login details.' }, 400)

  const limit = await takeRateLimit(`login:${clientKey(c)}`, 20)
  if (!limit.ok) return c.json({ error: 'Too many login attempts.' }, 429)

  const email = body.data.email.toLowerCase()
  const rows = await sql<{
    id: string
    email: string
    display_name: string
    password_hash: string
  }>(
    `select id, email, display_name, password_hash from users where email = $1`,
    [email],
  )
  const row = rows[0]
  if (!row || !(await verifyPassword(body.data.password, row.password_hash))) {
    return c.json({ error: 'Email or password is incorrect.' }, 401)
  }
  const user = {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
  }
  const token = await createSessionToken(user)
  setSessionCookie(c, token)
  const plant = await getPersonalPlant(user.id)
  return c.json({ user, plant })
})

app.post('/auth/logout', async (c) => {
  clearSessionCookie(c)
  return c.json({ ok: true })
})

app.get('/plants/global', async (c) => {
  const plant = await getGlobalPlant()
  return c.json({ plant })
})

app.get('/plants/personal', async (c) => {
  const user = await readSession(c)
  if (!user) return c.json({ error: 'Sign in to tend your own Zenna.' }, 401)
  const plant = await getPersonalPlant(user.id)
  return c.json({ plant })
})

app.post('/care', async (c) => {
  const body = careSchema.safeParse(await c.req.json().catch(() => null))
  if (!body.success || !isCareAction(body.data.action)) {
    return c.json({ error: 'Unknown care action.' }, 400)
  }

  const user = await readSession(c)
  if (body.data.scope === 'personal') {
    if (!user) return c.json({ error: 'Sign in to tend your own Zenna.' }, 401)
    const limit = await takeRateLimit(`care:personal:${user.id}`, 90)
    if (!limit.ok) {
      return c.json({ error: 'Easy — give your plant a moment to breathe.' }, 429)
    }
    const plant = await applyPlantCare({
      scope: 'personal',
      plantId: user.id,
      userId: user.id,
      action: body.data.action,
    })
    return c.json({ plant })
  }

  const key = user ? `care:global:user:${user.id}` : `care:global:ip:${clientKey(c)}`
  const limit = await takeRateLimit(key, user ? 60 : 30)
  if (!limit.ok) {
    return c.json({ error: 'Global Zenna has had enough care for now.' }, 429)
  }
  const plant = await applyPlantCare({
    scope: 'global',
    plantId: 'global',
    userId: user?.id ?? null,
    action: body.data.action,
  })
  return c.json({ plant })
})

app.get('/stats/roots', async (c) => {
  const count = await signupCount()
  const totals = await careTotals()
  return c.json({ signupCount: count, ...totals })
})

app.get('/stats/compete', async (c) => {
  const user = await readSession(c)
  const global = await getGlobalPlant()
  const totals = await careTotals()
  const personal = user ? await getPersonalPlant(user.id) : null
  return c.json({
    global,
    personal,
    totals,
    user: user
      ? { id: user.id, displayName: user.displayName, email: user.email }
      : null,
  })
})

app.onError((err, c) => {
  console.error('[zenna-api]', err)
  return c.json({ error: 'Something wilted on the server.' }, 500)
})

export default app
