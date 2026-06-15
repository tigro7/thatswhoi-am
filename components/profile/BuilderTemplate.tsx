import ProfileHeader from './shared/ProfileHeader'
import ProfileFooter from './shared/ProfileFooter'
import ContactLinks from './shared/ContactLinks'
import SkillTags from './shared/SkillTags'
import ArchetypeCard from './shared/ArchetypeCard'
import ImpactGrid from './ImpactGrid'
import type { ProfileData, ExperienceData } from './shared/types'

interface BuilderTemplateProps {
  profile: ProfileData
  experiences: ExperienceData[]
  isPreview?: boolean
  isPrint?: boolean
}

// Deterministic color per sector — cycles through orange palette
const SECTOR_COLORS = [
  'bg-orange-900/40 border-orange-700/50 text-orange-300',
  'bg-amber-900/40 border-amber-700/50 text-amber-300',
  'bg-yellow-900/40 border-yellow-700/50 text-yellow-300',
  'bg-red-900/40 border-red-700/50 text-red-300',
]

function sectorColor(sector: string, allSectors: string[]): string {
  const index = allSectors.indexOf(sector)
  return SECTOR_COLORS[index % SECTOR_COLORS.length]
}

export default function BuilderTemplate({ profile, experiences, isPreview, isPrint }: Readonly<BuilderTemplateProps>) {
  const totalYears = experiences.reduce((s, e) => s + e.years, 0)
  const uniqueSectors = [...new Set(experiences.map(e => e.sector))]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <ProfileHeader profile={profile} />

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-12">
        {/* Stats */}
        <ImpactGrid
          totalYears={totalYears}
          companiesCount={experiences.length}
          sectorsCount={uniqueSectors.length}
        />

        <SkillTags skills={profile.skills} />

        <ArchetypeCard
          icon="🏗️"
          name="The Builder"
          description={`${experiences.length} progetti in ${uniqueSectors.length} settori diversi. Il valore di chi sa costruire cose da zero e farle partire.`}
        />

        {/* Experience grid */}
        <section className="space-y-4">
          <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Impatti</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {experiences.map((exp) => (
              <div
                key={`${exp.company}-${exp.role}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-2 flex flex-col"
              >
                <span className={`self-start rounded-full border px-2.5 py-0.5 text-xs font-medium ${sectorColor(exp.sector, uniqueSectors)}`}>
                  {exp.sector}
                </span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium leading-snug">{exp.role}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{exp.company}</p>
                </div>
                {exp.description && (
                  <p className="text-zinc-500 text-xs leading-relaxed">{exp.description}</p>
                )}
                <p className="text-zinc-700 text-xs">{exp.years} {exp.years === 1 ? 'anno' : 'anni'}</p>
              </div>
            ))}
          </div>
        </section>

        <ContactLinks profile={profile} />
        <ProfileFooter slug={profile.slug} isPrint={isPreview || isPrint} />
      </main>
    </div>
  )
}
