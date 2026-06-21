import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

interface ExperienceUpdate {
  id: string
  description: string
}

interface SaveEnrichBody {
  userId: string
  slug: string
  linkedin_url?: string
  github_url?: string
  website_url?: string
  contact_email?: string
  skills?: string[]
  experienceDescriptions: ExperienceUpdate[]
}

async function adminFetch(path: string, method: string, body?: unknown) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')

  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=minimal',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase ${method} ${path} → ${res.status}: ${text}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as SaveEnrichBody
    const { userId, slug, linkedin_url, github_url, website_url, contact_email, skills, experienceDescriptions } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Update profile contact fields + skills
    await adminFetch(`profiles?id=eq.${userId}`, 'PATCH', {
      linkedin_url: linkedin_url ?? null,
      github_url: github_url ?? null,
      website_url: website_url ?? null,
      contact_email: contact_email ?? null,
      skills: skills ?? [],
      last_updated_at: new Date().toISOString(),
    })

    // Update each experience description individually
    await Promise.all(
      experienceDescriptions.map(({ id, description }) =>
        adminFetch(`experiences?id=eq.${id}`, 'PATCH', { description: description || null })
      )
    )

    if (slug) revalidatePath(`/${slug}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('save-enrich error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
