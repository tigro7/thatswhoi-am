import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'thatswhoi.am — Il tuo profilo professionale in 5 minuti',
  description: 'Crea un profilo professionale di impatto in meno di 5 minuti. Nessun template, nessuna personalizzazione obbligatoria.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950">{children}</body>
    </html>
  )
}
