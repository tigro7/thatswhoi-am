import { NextRequest, NextResponse } from 'next/server'

// Handles Supabase PKCE redirect landing on / instead of /auth/callback
// Moving this out of page.tsx makes the homepage statically prerenderable
export function middleware(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (code) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/callback'
    url.searchParams.delete('code')
    url.searchParams.set('code', code)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: '/',
}
