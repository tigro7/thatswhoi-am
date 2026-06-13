'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SlugPicker, { useSlugCheck } from '@/components/onboarding/SlugPicker'

function nameToSlug(firstName: string, lastName: string): string {
  const clean = (s: string) =>
    s.toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '')
  const f = clean(firstName)
  const l = clean(lastName)
  if (f && l) return `${f}.${l}`
  return f || l
}

export default function LoginPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  const slugStatus = useSlugCheck(slug)

  useEffect(() => {
    if (!slugEdited) {
      setSlug(nameToSlug(firstName, lastName))
    }
  }, [firstName, lastName, slugEdited])

  function handleSlugChange(value: string) {
    setSlugEdited(true)
    setSlug(value)
  }

  function handleContinue() {
    if (!firstName.trim() || !lastName.trim() || slugStatus !== 'available') return
    sessionStorage.setItem('pending_slug', slug)
    sessionStorage.setItem('pending_name', `${firstName.trim()} ${lastName.trim()}`)
    router.push('/onboarding')
  }

  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0 && slugStatus === 'available'

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1">
          <h1 className="text-white text-2xl font-semibold tracking-tight">thatswhoi.am</h1>
          <p className="text-zinc-400 text-sm">Come ti chiami? Creiamo il tuo URL personale.</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Nome"
              className="rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
            />
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Cognome"
              className="rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
            />
          </div>

          {slug && (
            <div className="space-y-1">
              <p className="text-zinc-500 text-xs">Il tuo URL — puoi modificarlo:</p>
              <SlugPicker value={slug} onChange={handleSlugChange} status={slugStatus} />
            </div>
          )}

          <button
            disabled={!canContinue}
            onClick={handleContinue}
            className="w-full rounded-xl bg-white text-black font-medium py-3 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 transition-colors"
          >
            Continua →
          </button>
        </div>
      </div>
    </main>
  )
}
