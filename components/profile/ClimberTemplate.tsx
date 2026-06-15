import ProfileHeader from './shared/ProfileHeader'
import ProfileFooter from './shared/ProfileFooter'
import ContactLinks from './shared/ContactLinks'
import SkillTags from './shared/SkillTags'
import ArchetypeCard from './shared/ArchetypeCard'
import GrowthTimeline from './GrowthTimeline'
import type { ProfileData, ExperienceData } from './shared/types'

interface ClimberTemplateProps {
  profile: ProfileData
  experiences: ExperienceData[]
  isPreview?: boolean
  isPrint?: boolean
}

export default function ClimberTemplate({ profile, experiences, isPreview, isPrint }: Readonly<ClimberTemplateProps>) {
  const totalYears = experiences.reduce((s, e) => s + e.years, 0)
  const mainSector = experiences.at(-1)?.sector ?? ''

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <ProfileHeader profile={profile} />

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

        <SkillTags skills={profile.skills} />

        <ArchetypeCard
          icon="📈"
          name="The Climber"
          description={`Crescita verticale in ${mainSector} su ${Math.round(totalYears)} anni. Il valore della profondità e della progressione continua.`}
        />

        <section className="space-y-4">
          <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Percorso</h2>
          <GrowthTimeline experiences={experiences} />
        </section>

        <ContactLinks profile={profile} />
        <ProfileFooter slug={profile.slug} isPrint={isPreview || isPrint} />
      </main>
    </div>
  )
}
