import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AdapterTemplate from '@/components/profile/AdapterTemplate'
import ClimberTemplate from '@/components/profile/ClimberTemplate'
import BuilderTemplate from '@/components/profile/BuilderTemplate'
import OwnerToolbar from '@/components/profile/OwnerToolbar'

// ISR — public profiles are cached for 5 minutes, busted on-demand by save routes
export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ print?: string }>
}

// cache() deduplicates across generateMetadata + ProfilePage in the same request
const getProfile = cache(async (slug: string) => {
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

  return { profile, experiences: experiences ?? [] }
})

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
  const ogImage = `/api/og?slug=${encodeURIComponent(slug)}`

  return {
    title: `${name} — thatswhoi.am`,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: `${name} — thatswhoi.am`,
      description,
      type: 'profile',
      images: [{ url: ogImage, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — thatswhoi.am`,
      description,
      images: [ogImage],
    },
  }
}

export default async function ProfilePage({ params, searchParams }: Readonly<Props>) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const data = await getProfile(slug) // deduplicated — no extra DB round-trip

  if (!data) notFound()

  const { profile, experiences } = data
  const isPrint = sp.print === 'true'
  const incomplete = isProfileIncomplete(profile, experiences)

  const templateProps = { profile, experiences, isPrint }

  let template: React.ReactNode
  if (profile.archetype === 'builder') {
    template = <BuilderTemplate {...templateProps} />
  } else if (profile.archetype === 'adapter') {
    template = <AdapterTemplate {...templateProps} />
  } else {
    template = <ClimberTemplate {...templateProps} />
  }

  return (
    <>
      {/* Owner UI is client-side — keeps SSR/ISR output auth-agnostic */}
      <OwnerToolbar profileId={profile.id} slug={slug} isIncomplete={incomplete} isPrint={isPrint} />
      {template}
    </>
  )
}
