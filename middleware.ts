import { NextRequest, NextResponse } from 'next/server'

// Routes that call Claude — rate-limited to prevent cost abuse
const AI_ROUTES = new Set([
  '/api/generate-descriptions',
  '/api/generate-headline',
  '/api/infer-sector',
])

// 10 requests per 10 minutes per IP — enough for a full enrichment flow
// with retries, but blocks automated abuse
const WINDOW = '10 m'
const MAX_REQUESTS = 10

async function rateLimit(req: NextRequest): Promise<NextResponse | null> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  // Graceful degradation — skip if Upstash is not configured (local dev)
  if (!redisUrl || !redisToken) return null

  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')

  const ratelimit = new Ratelimit({
    redis: new Redis({ url: redisUrl, token: redisToken }),
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, WINDOW),
    analytics: false,
    prefix: 'twhoi',
  })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const identifier = `${req.nextUrl.pathname}:${ip}`
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier)

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

  // Rate limit AI routes
  if (AI_ROUTES.has(pathname)) {
    const limited = await rateLimit(req)
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
  ],
}
