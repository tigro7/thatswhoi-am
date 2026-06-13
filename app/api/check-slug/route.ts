import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  const normalized = slug.toLowerCase().trim()
  const valid = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/.test(normalized)

  if (!valid) {
    return NextResponse.json({ available: false, reason: 'invalid' })
  }

  const reserved = ['admin', 'api', 'login', 'signup', 'onboarding', 'settings', 'dashboard', 'profile', 'public', 'static']
  if (reserved.includes(normalized)) {
    return NextResponse.json({ available: false, reason: 'reserved' })
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('slug')
    .eq('slug', normalized)
    .maybeSingle()

  return NextResponse.json({ available: data === null, reason: data ? 'taken' : null })
}
