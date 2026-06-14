import ImpactGrid from './ImpactGrid'

interface ProfileData {
  slug: string
  full_name: string | null
  headline: string | null
  location: string | null
  avatar_url: string | null
  is_open_to_work: boolean | null
}

interface ExperienceData {
  role: string
  company: string
  sector: string
  years: number
}

interface BuilderTemplateProps {
  profile: ProfileData
  experiences: ExperienceData[]
  isPreview?: boolean
}

export default function BuilderTemplate({ profile, experiences, isPreview }: Readonly<BuilderTemplateProps>) {
  const totalYears = experiences.reduce((s, e) => s + e.years, 0)
  const uniqueSectors = new Set(experiences.map(e => e.sector)).size

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800/60">
        <div className="max-w-2xl mx-auto px-6 py-8 flex items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            {profile.full_name && (
              <h1 className="text-2xl font-semibold tracking-tight">{profile.full_name}</h1>
            )}
            <p className="text-zinc-300 text-base leading-relaxed">{profile.headline}</p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {profile.location && (
                <span className="text-zinc-500 text-xs">{profile.location}</span>
              )}
              {profile.is_open_to_work && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/40 border border-emerald-700/40 px-2.5 py-1 text-emerald-400 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open to work
                </span>
              )}
            </div>
          </div>
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || ''}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-zinc-700 flex-shrink-0"
            />
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-12">
        {/* Impact grid */}
        <ImpactGrid
          totalYears={totalYears}
          companiesCount={experiences.length}
          sectorsCount={uniqueSectors}
        />

        {/* Archetype badge */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🏗️</div>
            <div>
              <h3 className="text-white font-semibold text-sm">The Builder</h3>
              <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                {experiences.length} progetti in {uniqueSectors} settori diversi.
                Il valore di chi sa costruire cose da zero e farle partire.
              </p>
            </div>
          </div>
        </section>

        {/* Esperienze */}
        <section className="space-y-4">
          <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Cosa ho costruito</h2>
          <div className="space-y-3">
            {experiences.map((exp, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-white text-sm font-medium">{exp.role}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{exp.company}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-zinc-600 text-xs">{exp.sector}</span>
                    <p className="text-zinc-600 text-xs mt-0.5">{exp.years} {exp.years === 1 ? 'anno' : 'anni'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {!isPreview && (
          <footer className="border-t border-zinc-800/60 pt-6 flex items-center justify-between">
            <p className="text-zinc-700 text-xs">thatswhoi.am/{profile.slug}</p>
            <a href="/" className="text-zinc-700 text-xs hover:text-zinc-400 transition-colors">
              Crea il tuo profilo →
            </a>
          </footer>
        )}
      </main>
    </div>
  )
}
