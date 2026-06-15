import GrowthTimeline from './GrowthTimeline'

interface ProfileData {
  slug: string
  full_name: string | null
  headline: string | null
  location: string | null
  avatar_url: string | null
  is_open_to_work: boolean | null
  linkedin_url?: string | null
  github_url?: string | null
  website_url?: string | null
  contact_email?: string | null
  skills?: string[] | null
}

interface ExperienceData {
  role: string
  company: string
  sector: string
  years: number
  description?: string | null
}

interface ClimberTemplateProps {
  profile: ProfileData
  experiences: ExperienceData[]
  isPreview?: boolean
}

export default function ClimberTemplate({ profile, experiences, isPreview }: Readonly<ClimberTemplateProps>) {
  const totalYears = experiences.reduce((s, e) => s + e.years, 0)
  const mainSector = experiences.at(-1)?.sector ?? ''
  const skills = profile.skills?.filter(Boolean) ?? []
  const contacts = [
    { label: 'LinkedIn', href: profile.linkedin_url },
    { label: 'GitHub', href: profile.github_url },
    { label: 'Sito', href: profile.website_url },
    { label: 'Email', href: profile.contact_email ? `mailto:${profile.contact_email}` : null },
  ].filter(c => c.href)

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
                  <span>Open to work</span>
                </span>
              )}
            </div>
          </div>
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-16 h-16 rounded-full object-cover ring-2 ring-zinc-700 flex-shrink-0" />
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-12">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-4xl font-bold text-white">{Math.round(totalYears)}</p>
            <p className="text-zinc-500 text-xs mt-1">{totalYears === 1 ? 'anno nel settore' : 'anni nel settore'}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-4xl font-bold text-white">{experiences.length}</p>
            <p className="text-zinc-500 text-xs mt-1">{experiences.length === 1 ? 'ruolo progressivo' : 'ruoli progressivi'}</p>
          </div>
        </div>

        {skills.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-zinc-300 text-xs">{s}</span>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📈</div>
            <div>
              <h3 className="text-white font-semibold text-sm">The Climber</h3>
              <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                Crescita verticale in {mainSector} su {Math.round(totalYears)} anni.
                Il valore della profondità e della progressione continua.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Percorso</h2>
          <GrowthTimeline experiences={experiences} />
        </section>

        {contacts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Contatti</h2>
            <div className="flex flex-wrap gap-3">
              {contacts.map(({ label, href }) => (
                <a key={label} href={href!} target="_blank" rel="noopener noreferrer" className="text-zinc-400 text-sm hover:text-white transition-colors underline underline-offset-2">
                  {label}
                </a>
              ))}
            </div>
          </section>
        )}

        {!isPreview && (
          <footer className="border-t border-zinc-800/60 pt-6 flex items-center justify-between">
            <p className="text-zinc-700 text-xs">thatswhoi.am/{profile.slug}</p>
            <a href="/" className="text-zinc-700 text-xs hover:text-zinc-400 transition-colors">Crea il tuo profilo →</a>
          </footer>
        )}
      </main>
    </div>
  )
}
