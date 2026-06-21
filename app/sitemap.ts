import type { MetadataRoute } from 'next'

// Revalidate every hour — picks up new profiles without a redeploy
export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://onepagecv-theta.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return staticEntries

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=slug,last_updated_at&order=created_at.desc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!res.ok) return staticEntries

    const profiles: Array<{ slug: string; last_updated_at: string | null }> = await res.json()

    const profileEntries: MetadataRoute.Sitemap = profiles.map(p => ({
      url: `${BASE_URL}/${p.slug}`,
      lastModified: p.last_updated_at ? new Date(p.last_updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticEntries, ...profileEntries]
  } catch {
    return staticEntries
  }
}
