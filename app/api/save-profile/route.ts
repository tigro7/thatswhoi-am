import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Experience } from '@/lib/archetype'
import type { Archetype } from '@/lib/archetype'

interface SaveProfileBody {
  userId: string
  slug: string
  fullName: string
  email: string
  archetype: Archetype
  headline: string
  experiences: Experience[]
}

// Uses service role key — bypasses RLS to save data even before email confirmation
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as SaveProfileBody
    const { userId, slug, fullName, email, archetype, headline, experiences } = body

    if (!userId || !slug || !archetype || !headline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await adminClient.from('profiles').upsert({
      id: userId,
      slug,
      email,
      full_name: fullName,
      archetype,
      headline,
      last_updated_at: new Date().toISOString(),
    })

    await adminClient.from('experiences').delete().eq('profile_id', userId)
    await adminClient.from('experiences').insert(
      experiences.map((exp, i) => ({
        profile_id: userId,
        role: exp.role,
        company: exp.company,
        sector: exp.sector,
        years: exp.years,
        position: i,
      }))
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('save-profile error:', err)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
