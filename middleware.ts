import { NextRequest, NextResponse } from 'next/server'

// Routes that call Claude — 10 req / 10 min per IP
const AI_ROUTES = new Set([
  '/api/generate-descriptions',
  '/api/generate-headline',
  '/api/infer-sector',
])

// PDF generation spins up Chromium — 3 req / 5 min per IP

async function rateLimit(
  req: NextRequest,
  max: number,
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`,
  prefix: string,
): Promise<NextResponse | null> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  // Graceful degradation — skip if Upstash is not configured (local dev)
  if (!redisUrl || !redisToken) return null

  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')

  const limiter = new Ratelimit({
    redis: new Redis({ url: redisUrl, token: redisToken }),
    limiter: Ratelimit.slidingWindow(max, window),
    analytics: false,
    prefix,
  })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const { success, limit, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova tra qualche minuto.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    )
  }

  return null
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Supabase PKCE redirect safety net
  if (pathname === '/') {
    const code = req.nextUrl.searchParams.get('code')
    if (code) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/callback'
      return NextResponse.redirect(url)
    }
  }

  if (AI_ROUTES.has(pathname)) {
    const limited = await rateLimit(req, 10, '10 m', 'twhoi:ai')
    if (limited) return limited
  }

  if (pathname.startsWith('/api/export-pdf/')) {
    const limited = await rateLimit(req, 3, '5 m', 'twhoi:pdf')
    if (limited) return limited
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/api/generate-descriptions',
    '/api/generate-headline',
    '/api/infer-sector',
    '/api/export-pdf/:path*',
  ],
}
