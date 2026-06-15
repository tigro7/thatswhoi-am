import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AdapterTemplate from '@/components/profile/AdapterTemplate'
import ClimberTemplate from '@/components/profile/ClimberTemplate'
import BuilderTemplate from '@/components/profile/BuilderTemplate'

interface Props {
  params: Promise<{ slug: string }>
}

async function getProfile(slug: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!profile) return null

  const { data: experiences } = await supabase
    .from('experiences')
    .select('role, company, sector, years, description, position')
    .eq('profile_id', profile.id)
    .order('position', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  return { profile, experiences: experiences ?? [], isOwner: user?.id === profile.id }
}

function isProfileIncomplete(profile: Record<string, unknown>, experiences: Array<Record<string, unknown>>) {
  const noContacts = !profile.linkedin_url && !profile.github_url && !profile.website_url
  const noDescriptions = experiences.every(e => !e.description)
  const noSkills = !profile.skills || (profile.skills as string[]).length === 0
  return noContacts && noDescriptions && noSkills
}

export async function generateMetadata({ params }: Readonly<Props>): Promise<Metadata> {
  const { slug } = await params
  const data = await getProfile(slug)

  if (!data) return { title: 'Profilo non trovato — thatswhoi.am' }

  const name = data.profile.full_name || slug
  const description = data.profile.headline || `Il profilo professionale di ${name}`

  return {
    title: `${name} — thatswhoi.am`,
    description,
    openGraph: { title: `${name} — thatswhoi.am`, description, type: 'profile' },
  }
}

export default async function ProfilePage({ params }: Readonly<Props>) {
  const { slug } = await params
  const data = await getProfile(slug)

  if (!data) notFound()

  const { profile, experiences, isOwner } = data
  const showEnrichCta = isOwner && isProfileIncomplete(profile, experiences)

  const templateProps = { profile, experiences }

  return (
    <>
      {showEnrichCta && (
        <div className="bg-zinc-900 border-b border-zinc-800">
          <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <p className="text-zinc-400 text-sm">Il tuo profilo è live. Aggiungi descrizioni, link e skills per renderlo ancora più completo.</p>
            <Link href="/enrich" className="shrink-0 rounded-lg bg-white text-black text-xs font-medium px-3 py-1.5 hover:bg-zinc-100 transition-colors">
              Completa →
            </Link>
          </div>
        </div>
      )}
      {profile.archetype === 'climber' && <ClimberTemplate {...templateProps} />}
      {profile.archetype === 'builder' && <BuilderTemplate {...templateProps} />}
      {profile.archetype !== 'climber' && profile.archetype !== 'builder' && <AdapterTemplate {...templateProps} />}
    </>
  )
}
