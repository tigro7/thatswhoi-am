import { notFound } from 'next/navigation'
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
    .select('role, company, sector, years, position')
    .eq('profile_id', profile.id)
    .order('position', { ascending: true })

  return { profile, experiences: experiences ?? [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getProfile(slug)

  if (!data) {
    return { title: 'Profilo non trovato — thatswhoi.am' }
  }

  const name = data.profile.full_name || slug
  const description = data.profile.headline || `Il profilo professionale di ${name}`

  return {
    title: `${name} — thatswhoi.am`,
    description,
    openGraph: {
      title: `${name} — thatswhoi.am`,
      description,
      type: 'profile',
    },
  }
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params
  const data = await getProfile(slug)

  if (!data) notFound()

  const { profile, experiences } = data

  if (profile.archetype === 'climber') {
    return <ClimberTemplate profile={profile} experiences={experiences} />
  }
  if (profile.archetype === 'builder') {
    return <BuilderTemplate profile={profile} experiences={experiences} />
  }
  return <AdapterTemplate profile={profile} experiences={experiences} />
}
