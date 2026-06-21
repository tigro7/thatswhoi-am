import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://onepagecv-theta.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'thatswhoi.am — Il tuo profilo professionale in 5 minuti',
  description: 'Crea un profilo professionale di impatto in meno di 5 minuti. Nessun template, nessuna personalizzazione obbligatoria.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'thatswhoi.am',
    title: 'thatswhoi.am — Il tuo profilo professionale in 5 minuti',
    description: 'Crea un profilo professionale di impatto in meno di 5 minuti.',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'thatswhoi.am' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/api/og'],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${geist.variable} h-full antialiased`}>
      <Analytics />
      <body className="min-h-full bg-zinc-950">{children}</body>
    </html>
  )
}
