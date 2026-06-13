export type Archetype = 'adapter' | 'climber' | 'builder'

export interface Experience {
  role: string
  company: string
  sector: string
  years: number
}

export interface ArchetypeResult {
  primary: Archetype
  secondary: Archetype
  scores: Record<Archetype, number>
}

export function computeArchetype(experiences: Experience[]): ArchetypeResult {
  const totalYears = experiences.reduce((s, e) => s + e.years, 0)
  const numCompanies = experiences.length
  const avgTenure = totalYears / numCompanies
  const sectors = experiences.map(e => e.sector).filter(Boolean)
  const uniqueSectors = new Set(sectors).size
  const sectorVariance = sectors.length > 0 ? uniqueSectors / sectors.length : 0

  const raw = { adapter: 0, climber: 0, builder: 0 }

  // Climber: pochi datori di lavoro, alta tenure, settore coerente
  if (avgTenure > 3 && numCompanies <= 3) raw.climber += 40
  if (avgTenure > 2) raw.climber += 20
  if (totalYears > 8) raw.climber += 20
  if (sectorVariance < 0.4) raw.climber += 20

  // Builder: molte aziende, tenure bassa, impatto concreto
  if (numCompanies >= 4 && avgTenure < 2.5) raw.builder += 40
  if (numCompanies >= 3) raw.builder += 30
  if (totalYears > 4) raw.builder += 30

  // Adapter: alta varianza di settori, carriera trasversale
  if (sectorVariance > 0.6) raw.adapter += 50
  if (numCompanies >= 3) raw.adapter += 25
  if (sectorVariance > 0.8) raw.adapter += 25

  const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1
  const scores = {
    adapter: Math.round((raw.adapter / total) * 100),
    climber: Math.round((raw.climber / total) * 100),
    builder: Math.round((raw.builder / total) * 100),
  }

  const sorted = (Object.entries(scores) as [Archetype, number][])
    .sort((a, b) => b[1] - a[1])

  return {
    primary: sorted[0][0],
    secondary: sorted[1][0],
    scores,
  }
}
