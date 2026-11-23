import { sql } from './db'

const KNOWN = new Set([
  'herb_hugger',
  'green_thumb',
  'night_light',
  'bounty_hunter',
  'hands_muddy',
  'dedicated',
  'farmer_philanthropist',
])

export function filterKnownAchievements(ids: string[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const id of ids) {
    if (!KNOWN.has(id) || seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

export async function listAchievements(userId: string): Promise<string[]> {
  const rows = await sql<{ achievement_id: string }>(
    `select achievement_id from user_achievements
     where user_id = $1
     order by unlocked_at asc`,
    [userId],
  )
  return rows.map((r) => r.achievement_id)
}

export async function unlockAchievements(
  userId: string,
  ids: string[],
): Promise<string[]> {
  const clean = filterKnownAchievements(ids)
  if (!clean.length) return listAchievements(userId)

  for (const id of clean) {
    await sql(
      `insert into user_achievements (user_id, achievement_id)
       values ($1, $2)
       on conflict (user_id, achievement_id) do nothing`,
      [userId, id],
    )
  }
  return listAchievements(userId)
}
