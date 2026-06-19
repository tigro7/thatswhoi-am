import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crea il tuo profilo — thatswhoi.am',
  alternates: { canonical: '/login' },
  openGraph: {
    title: 'Crea il tuo profilo — thatswhoi.am',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'thatswhoi.am' }],
  },
  robots: { index: false },
}

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
