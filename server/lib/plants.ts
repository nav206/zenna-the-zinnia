import { applyCare, softFloor, type CareAction, type MoodStats } from './careMath'
import { sql } from './db'

export type PlantView = MoodStats & {
  id: string
  scope: 'global' | 'personal'
  updatedAt: string
}

type MoodRow = {
  id: string
  scope: 'global' | 'personal'
  hydration: number
  neatness: number
  light: number
  joy: number
  total_care: number
  updated_at: string | Date
}

function mapRow(row: MoodRow): PlantView {
  const mood = softFloor({
    hydration: Number(row.hydration),
    neatness: Number(row.neatness),
    light: Number(row.light),
    joy: Number(row.joy),
    totalCare: Number(row.total_care),
  })
  return {
    id: row.id,
    scope: row.scope,
    ...mood,
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export async function getGlobalPlant(): Promise<PlantView> {
  const rows = await sql<MoodRow>(
    `select id, scope, hydration, neatness, light, joy, total_care, updated_at
     from plant_moods where id = 'global'`,
  )
  if (rows[0]) return mapRow(rows[0])
  await sql(
    `insert into plant_moods (id, scope) values ('global', 'global')
     on conflict (id) do nothing`,
  )
  const again = await sql<MoodRow>(
    `select id, scope, hydration, neatness, light, joy, total_care, updated_at
     from plant_moods where id = 'global'`,
  )
  return mapRow(again[0])
}

export async function getPersonalPlant(userId: string): Promise<PlantView> {
  const rows = await sql<MoodRow>(
    `select id, scope, hydration, neatness, light, joy, total_care, updated_at
     from plant_moods where id = $1 and scope = 'personal'`,
    [userId],
  )
  if (rows[0]) return mapRow(rows[0])
  await sql(
    `insert into plant_moods (id, scope, user_id)
     values ($1, 'personal', $2)
     on conflict (id) do nothing`,
    [userId, userId],
  )
  const again = await sql<MoodRow>(
    `select id, scope, hydration, neatness, light, joy, total_care, updated_at
     from plant_moods where id = $1`,
    [userId],
  )
  return mapRow(again[0])
}

export async function applyPlantCare(opts: {
  scope: 'global' | 'personal'
  plantId: string
  userId: string | null
  action: CareAction
}): Promise<PlantView> {
  const current =
    opts.scope === 'global'
      ? await getGlobalPlant()
      : await getPersonalPlant(opts.plantId)
  const next = applyCare(current, opts.action)
  await sql(
    `update plant_moods
     set hydration = $2, neatness = $3, light = $4, joy = $5,
         total_care = $6, updated_at = now()
     where id = $1`,
    [
      opts.plantId,
      next.hydration,
      next.neatness,
      next.light,
      next.joy,
      next.totalCare,
    ],
  )
  await sql(
    `insert into care_events (id, user_id, plant_scope, plant_id, action)
     values ($1, $2, $3, $4, $5)`,
    [crypto.randomUUID(), opts.userId, opts.scope, opts.plantId, opts.action],
  )
  return {
    id: opts.plantId,
    scope: opts.scope,
    ...next,
    updatedAt: new Date().toISOString(),
  }
}

export async function signupCount(): Promise<number> {
  const rows = await sql<{ count: string | number }>(
    'select count(*)::int as count from users',
  )
  return Number(rows[0]?.count ?? 0)
}

export async function careTotals() {
  const rows = await sql<{ plant_scope: string; count: string | number }>(
    `select plant_scope, count(*)::int as count
     from care_events
     group by plant_scope`,
  )
  const out = { globalCareEvents: 0, personalCareEvents: 0 }
  for (const row of rows) {
    if (row.plant_scope === 'global') out.globalCareEvents = Number(row.count)
    if (row.plant_scope === 'personal') {
      out.personalCareEvents = Number(row.count)
    }
  }
  return out
}
