import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const ARCHETYPE_LABEL: Record<string, string> = {
  adapter: '🔀 The Adapter',
  climber: '📈 The Climber',
  builder: '🏗️ The Builder',
}

async function fetchProfile(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const res = await fetch(
    `${url}/rest/v1/profiles?slug=eq.${encodeURIComponent(slug)}&select=full_name,headline,archetype&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  )
  if (!res.ok) return null
  const [profile] = await res.json()
  return profile ?? null
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')

  let name = 'thatswhoi.am'
  let headline = 'Il tuo profilo professionale in 5 minuti.'
  let archetypeLabel = ''

  if (slug) {
    const profile = await fetchProfile(slug)
    if (profile) {
      name = profile.full_name ?? slug
      headline = profile.headline ?? ''
      archetypeLabel = ARCHETYPE_LABEL[profile.archetype] ?? ''
    }
  }

  const truncatedHeadline = headline.length > 110 ? `${headline.slice(0, 107)}…` : headline

  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 80px',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top: brand */}
        <div style={{ display: 'flex', color: '#52525b', fontSize: 22, letterSpacing: '0.05em' }}>
          thatswhoi.am
        </div>

        {/* Middle: content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {archetypeLabel && (
            <div style={{ display: 'flex', color: '#71717a', fontSize: 22 }}>
              {archetypeLabel}
            </div>
          )}
          <div style={{ color: '#ffffff', fontSize: slug ? 58 : 64, fontWeight: 700, lineHeight: 1.1 }}>
            {name}
          </div>
          {truncatedHeadline && (
            <div style={{ color: '#a1a1aa', fontSize: 26, lineHeight: 1.5, maxWidth: 900 }}>
              {truncatedHeadline}
            </div>
          )}
        </div>

        {/* Bottom: URL */}
        <div style={{ display: 'flex', color: '#3f3f46', fontSize: 20 }}>
          {slug ? `thatswhoi.am/${slug}` : 'thatswhoi.am'}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
