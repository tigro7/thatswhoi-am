import ProfileHeader from './shared/ProfileHeader'
import ProfileFooter from './shared/ProfileFooter'
import ContactLinks from './shared/ContactLinks'
import SkillTags from './shared/SkillTags'
import ArchetypeCard from './shared/ArchetypeCard'
import type { ProfileData, ExperienceData } from './shared/types'

interface AdapterTemplateProps {
  profile: ProfileData
  experiences: ExperienceData[]
  isPreview?: boolean
  isPrint?: boolean
}

// Deterministic color per sector — cycles through purple palette
const SECTOR_COLORS = [
  'bg-violet-900/40 border-violet-700/50 text-violet-300',
  'bg-purple-900/40 border-purple-700/50 text-purple-300',
  'bg-fuchsia-900/40 border-fuchsia-700/50 text-fuchsia-300',
  'bg-indigo-900/40 border-indigo-700/50 text-indigo-300',
]

function sectorColor(sector: string, allSectors: string[]): string {
  const index = allSectors.indexOf(sector)
  return SECTOR_COLORS[index % SECTOR_COLORS.length]
}

export default function AdapterTemplate({ profile, experiences, isPreview, isPrint }: Readonly<AdapterTemplateProps>) {
  const totalYears = experiences.reduce((s, e) => s + e.years, 0)
  const uniqueSectors = [...new Set(experiences.map(e => e.sector))]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <ProfileHeader profile={profile} />

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-12">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-4xl font-bold text-white">{Math.round(totalYears)}</p>
            <p className="text-zinc-500 text-xs mt-1">{totalYears === 1 ? 'anno di carriera' : 'anni di carriera'}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-4xl font-bold text-white">{uniqueSectors.length}</p>
            <p className="text-zinc-500 text-xs mt-1">{uniqueSectors.length === 1 ? 'settore' : 'settori'}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 col-span-2 sm:col-span-1">
            <p className="text-4xl font-bold text-white">{experiences.length}</p>
            <p className="text-zinc-500 text-xs mt-1">{experiences.length === 1 ? 'azienda' : 'aziende'}</p>
          </div>
        </div>

        <SkillTags skills={profile.skills} emphasis="large" />

        <ArchetypeCard
          icon="🔀"
          name="The Adapter"
          description={`Carriera trasversale in ${uniqueSectors.length} settori diversi in ${Math.round(totalYears)} anni. Il valore di chi sa connettere mondi che non si parlano.`}
        />

        {/* Horizontal journey */}
        <section className="space-y-4">
          <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Percorso</h2>
          <div className="flex flex-wrap items-start gap-1">
            {experiences.map((exp, i) => (
              <div key={`${exp.company}-${exp.role}`} className="flex items-center gap-1">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 min-w-[120px]">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs mb-1.5 ${sectorColor(exp.sector, uniqueSectors)}`}>
                    {exp.sector}
                  </span>
                  <p className="text-white text-xs font-medium leading-snug">{exp.role}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{exp.years} {exp.years === 1 ? 'anno' : 'anni'}</p>
                </div>
                {i < experiences.length - 1 && (
                  <span className="text-zinc-700 text-xs px-0.5">→</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Detail list with descriptions */}
        {experiences.some(e => e.description) && (
          <section className="space-y-3">
            <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Dettaglio</h2>
            <div className="space-y-3">
              {experiences.filter(e => e.description).map((exp) => (
                <div key={`detail-${exp.company}-${exp.role}`} className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-4 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white text-sm font-medium">{exp.role}</p>
                    <span className="text-zinc-600 text-xs">·</span>
                    <p className="text-zinc-400 text-xs">{exp.company}</p>
                  </div>
                  <p className="text-zinc-500 text-xs leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <ContactLinks profile={profile} />
        <ProfileFooter slug={profile.slug} isPrint={isPreview || isPrint} />
      </main>
    </div>
  )
}
