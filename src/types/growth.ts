export type GrowthWeek = {
  week: number
  date: string
  heightCm: number
  title?: string
  note: string
  photo?: string
}

export type PlantStats = {
  sunbathingHours: number
  waterDrunkMl: number
  leavesGrown: number
  leavesShed: number
  buds: number
  flowers: number
  updated: string
  notes?: string
}

export type GrowthDiary = {
  version: number
  plant: {
    name: string
    species: string
    adopted: string
  }
  stats?: PlantStats
  weeks: GrowthWeek[]
}
