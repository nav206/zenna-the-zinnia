import {
  applyCare,
  isActionUnlocked,
  SEEDLING_DEFAULTS,
  softFloor,
  stageFromCare,
  unlockHint,
  type CareAction,
  type GrowthStage,
  type MoodStats,
} from './careMath'
import { sql } from './db'

export type PlantView = MoodStats & {
  id: string
  scope: 'global' | 'personal'
  growthStage: GrowthStage
  unlockedActions: CareAction[]
  plantName: string | null
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
  growth_stage: string | null
  plant_name: string | null
  updated_at: string | Date
}

function normalizeStage(
  scope: 'global' | 'personal',
  totalCare: number,
  raw: string | null,
): GrowthStage {
  if (scope === 'global') return 'mature'
  const fromCare = stageFromCare(totalCare)
  if (raw === 'seedling' || raw === 'growing' || raw === 'mature') {
    // Never let a stored stage lag behind care progress.
    const order = { seedling: 0, growing: 1, mature: 2 }
    return order[fromCare] >= order[raw] ? fromCare : raw
  }
  return fromCare
}

function mapRow(row: MoodRow): PlantView {
  const mood = softFloor({
    hydration: Number(row.hydration),
    neatness: Number(row.neatness),
    light: Number(row.light),
    joy: Number(row.joy),
    totalCare: Number(row.total_care),
  })
  const growthStage = normalizeStage(row.scope, mood.totalCare, row.growth_stage)
  return {
    id: row.id,
    scope: row.scope,
    ...mood,
    growthStage,
    unlockedActions: growthStage === 'mature'
      ? (['water', 'prune', 'sunlight', 'sing', 'deadhead'] as CareAction[])
      : growthStage === 'growing'
        ? (['water', 'sunlight', 'sing', 'prune'] as CareAction[])
        : (['water', 'sunlight', 'sing'] as CareAction[]),
    plantName: row.plant_name?.trim() || null,
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

const SELECT_MOOD = `select id, scope, hydration, neatness, light, joy, total_care,
  coalesce(growth_stage, 'seedling') as growth_stage, plant_name, updated_at
  from plant_moods`

export async function getGlobalPlant(): Promise<PlantView> {
  const rows = await sql<MoodRow>(`${SELECT_MOOD} where id = 'global'`)
  if (rows[0]) return mapRow(rows[0])
  await sql(
    `insert into plant_moods (id, scope, growth_stage)
     values ('global', 'global', 'mature')
     on conflict (id) do nothing`,
  )
  const again = await sql<MoodRow>(`${SELECT_MOOD} where id = 'global'`)
  return mapRow(again[0])
}

export async function getPersonalPlant(userId: string): Promise<PlantView> {
  const rows = await sql<MoodRow>(
    `${SELECT_MOOD} where id = $1 and scope = 'personal'`,
    [userId],
  )
  if (rows[0]) return mapRow(rows[0])
  await sql(
    `insert into plant_moods (
       id, scope, user_id, hydration, neatness, light, joy, total_care, growth_stage
     ) values ($1, 'personal', $2, $3, $4, $5, $6, 0, 'seedling')
     on conflict (id) do nothing`,
    [
      userId,
      userId,
      SEEDLING_DEFAULTS.hydration,
      SEEDLING_DEFAULTS.neatness,
      SEEDLING_DEFAULTS.light,
      SEEDLING_DEFAULTS.joy,
    ],
  )
  const again = await sql<MoodRow>(`${SELECT_MOOD} where id = $1`, [userId])
  return mapRow(again[0])
}

export async function setPersonalPlantName(
  userId: string,
  plantName: string,
): Promise<PlantView> {
  await getPersonalPlant(userId)
  await sql(`update plant_moods set plant_name = $2 where id = $1 and scope = 'personal'`, [
    userId,
    plantName,
  ])
  return getPersonalPlant(userId)
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

  if (opts.scope === 'personal' && !isActionUnlocked(current.growthStage, opts.action)) {
    const hint = unlockHint(opts.action, current.growthStage)
    throw new CareLockedError(hint || 'Action locked until your plant grows.')
  }

  const next = applyCare(current, opts.action)
  const growthStage =
    opts.scope === 'global' ? 'mature' : stageFromCare(next.totalCare)

  await sql(
    `update plant_moods
     set hydration = $2, neatness = $3, light = $4, joy = $5,
         total_care = $6, growth_stage = $7, updated_at = now()
     where id = $1`,
    [
      opts.plantId,
      next.hydration,
      next.neatness,
      next.light,
      next.joy,
      next.totalCare,
      growthStage,
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
    growthStage,
    unlockedActions: mapRow({
      id: opts.plantId,
      scope: opts.scope,
      hydration: next.hydration,
      neatness: next.neatness,
      light: next.light,
      joy: next.joy,
      total_care: next.totalCare,
      growth_stage: growthStage,
      plant_name: current.plantName,
      updated_at: new Date(),
    }).unlockedActions,
    plantName: current.plantName,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Personal tending also waters the shared Global Zenna —
 * every personal care action counts toward global statistics.
 */
export async function mirrorPersonalCareToGlobal(opts: {
  userId: string
  action: CareAction
}): Promise<PlantView> {
  return applyPlantCare({
    scope: 'global',
    plantId: 'global',
    userId: opts.userId,
    action: opts.action,
  })
}

export class CareLockedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CareLockedError'
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
