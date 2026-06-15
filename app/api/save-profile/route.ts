import { NextRequest, NextResponse } from 'next/server'
import type { Experience, Archetype } from '@/lib/archetype'

interface SaveProfileBody {
  userId: string
  slug: string
  fullName: string
  email: string
  archetype: Archetype
  headline: string
  experiences: Experience[]
}

async function supabaseAdmin(path: string, method: string, body?: unknown) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')

  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': method === 'POST' ? 'return=minimal' : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase ${method} ${path} → ${res.status}: ${text}`)
  }
  return res
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as SaveProfileBody
    const { userId, slug, fullName, email, archetype, headline, experiences } = body

    if (!userId || !slug || !archetype || !headline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upsert profile
    await supabaseAdmin('profiles?on_conflict=id', 'POST', {
      id: userId,
      slug,
      email,
      full_name: fullName,
      archetype,
      headline,
      last_updated_at: new Date().toISOString(),
    })

    // Replace experiences
    await supabaseAdmin(`experiences?profile_id=eq.${userId}`, 'DELETE')
    if (experiences.length > 0) {
      await supabaseAdmin('experiences', 'POST',
        experiences.map((exp, i) => ({
          profile_id: userId,
          role: exp.role,
          company: exp.company,
          sector: exp.sector,
          years: exp.years,
          position: i,
        }))
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('save-profile error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
