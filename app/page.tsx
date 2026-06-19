import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    title: 'thatswhoi.am — Il tuo profilo professionale in 5 minuti',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'thatswhoi.am' }],
  },
}

interface Props {
  searchParams: Promise<{ code?: string }>
}

// If Supabase redirects to /?code=... (misconfigured redirect URL),
// forward to the proper auth callback handler
export default async function HomePage({ searchParams }: Readonly<Props>) {
  const { code } = await searchParams
  if (code) {
    redirect(`/auth/callback?code=${code}`)
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-white text-4xl font-bold tracking-tight">thatswhoi.am</h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Il tuo profilo professionale di impatto in meno di 5 minuti.
            Nessun template. Nessuna scelta. Solo il tuo valore.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-block rounded-xl bg-white text-black font-medium px-8 py-3.5 text-sm hover:bg-zinc-100 transition-colors"
        >
          Crea il tuo profilo →
        </Link>

        <p className="text-zinc-700 text-xs">
          Gratis. Nessuna carta di credito richiesta.
        </p>
      </div>
    </main>
  )
}
