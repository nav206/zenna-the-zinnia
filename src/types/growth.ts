export type GrowthWeek = {
  week: number
  date: string
  heightCm: number
  note: string
  photo?: string
}

export type GrowthDiary = {
  version: number
  plant: {
    name: string
    species: string
    adopted: string
  }
  weeks: GrowthWeek[]
}
