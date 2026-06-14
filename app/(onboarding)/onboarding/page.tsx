'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ExperienceForm from '@/components/onboarding/ExperienceForm'
import GeneratingScreen from '@/components/onboarding/GeneratingScreen'
import AuthGate from '@/components/onboarding/AuthGate'
import AdapterTemplate from '@/components/profile/AdapterTemplate'
import ClimberTemplate from '@/components/profile/ClimberTemplate'
import BuilderTemplate from '@/components/profile/BuilderTemplate'
import { computeArchetype } from '@/lib/archetype'
import type { Experience, Archetype } from '@/lib/archetype'

type Phase = 'experiences' | 'generating' | 'preview' | 'saving'

interface GeneratedData {
  headline: string
  archetype: Archetype
}

const SS_SLUG = 'pending_slug'
const SS_NAME = 'pending_name'
const SS_EXPERIENCES = 'pending_experiences'
const SS_GENERATED = 'pending_generated'

export default function OnboardingPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('experiences')
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [slug, setSlug] = useState('')
  const [fullName, setFullName] = useState('')
  const [generated, setGenerated] = useState<GeneratedData | null>(null)

  // Restore all state from sessionStorage on mount
  useEffect(() => {
    const savedSlug = sessionStorage.getItem(SS_SLUG) || ''
    const savedName = sessionStorage.getItem(SS_NAME) || ''
    const savedExps = sessionStorage.getItem(SS_EXPERIENCES)
    const savedGen = sessionStorage.getItem(SS_GENERATED)

    if (!savedSlug) { router.replace('/login'); return }

    setSlug(savedSlug)
    setFullName(savedName)
    if (savedExps) setExperiences(JSON.parse(savedExps))
    if (savedGen) {
      setGenerated(JSON.parse(savedGen))
      setPhase('preview')
    }
  }, [router])

  // Persist experiences whenever they change
  useEffect(() => {
    if (experiences.length > 0) {
      sessionStorage.setItem(SS_EXPERIENCES, JSON.stringify(experiences))
    }
  }, [experiences])

  async function handleGenerate() {
    if (experiences.length === 0) return
    setPhase('generating')

    try {
      const totalYears = experiences.reduce((s, e) => s + e.years, 0)
      const archetypeResult = computeArchetype(experiences)

      const res = await fetch('/api/generate-headline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experiences, archetype: archetypeResult.primary, totalYears }),
      })
      const { headline } = await res.json()

      const data: GeneratedData = { headline, archetype: archetypeResult.primary }
      setGenerated(data)
      sessionStorage.setItem(SS_GENERATED, JSON.stringify(data))
      setPhase('preview')
    } catch (err) {
      console.error('Generation error:', err)
      setPhase('experiences')
      alert('Qualcosa è andato storto. Riprova.')
    }
  }

  function handleBackToEdit() {
    sessionStorage.removeItem(SS_GENERATED)
    setGenerated(null)
    setPhase('experiences')
  }

  // Save already happened in AuthGate via /api/save-profile — just redirect
  function handleAuthSuccess(_userId: string, _userEmail: string) {
    if (!generated) return
    setPhase('saving')
    ;[SS_SLUG, SS_NAME, SS_EXPERIENCES, SS_GENERATED].forEach(k => sessionStorage.removeItem(k))
    router.push(`/${slug}`)
  }

  if (phase === 'generating' || phase === 'saving') {
    return <GeneratingScreen />
  }

  if (phase === 'preview' && generated) {
    const previewProfile = {
      slug,
      full_name: fullName || null,
      headline: generated.headline,
      location: null,
      avatar_url: null,
      is_open_to_work: false,
    }

    return (
      <div>
        {/* Back button fixed at top */}
        <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800/60 px-6 py-3 flex items-center justify-between">
          <button
            onClick={handleBackToEdit}
            className="text-zinc-400 text-sm hover:text-white transition-colors"
          >
            ← Modifica esperienze
          </button>
          <span className="text-zinc-600 text-xs">Anteprima</span>
        </div>

        {generated.archetype === 'climber' && (
          <ClimberTemplate profile={previewProfile} experiences={experiences} isPreview />
        )}
        {generated.archetype === 'builder' && (
          <BuilderTemplate profile={previewProfile} experiences={experiences} isPreview />
        )}
        {generated.archetype !== 'climber' && generated.archetype !== 'builder' && (
          <AdapterTemplate profile={previewProfile} experiences={experiences} isPreview />
        )}

        <div className="max-w-2xl mx-auto px-6 pb-16">
          <AuthGate
            slug={slug}
            fullName={fullName}
            archetype={generated.archetype}
            headline={generated.headline}
            experiences={experiences}
            onSuccess={handleAuthSuccess}
          />
        </div>
      </div>
    )
  }

  const expLabel = experiences.length === 1 ? 'esperienza aggiunta' : 'esperienze aggiunte'
  const footerNote = experiences.length === 0
    ? 'Aggiungi almeno 1 esperienza per continuare'
    : `${experiences.length} ${expLabel}`

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="max-w-lg mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-white text-2xl font-semibold tracking-tight">Le tue esperienze</h1>
          <p className="text-zinc-400 text-sm">
            Aggiungi almeno un'esperienza lavorativa. Puoi inserirne quante vuoi.
          </p>
        </div>

        <ExperienceForm experiences={experiences} onChange={setExperiences} />

        {experiences.length > 0 && (
          <button
            onClick={handleGenerate}
            className="w-full rounded-xl bg-white text-black font-medium py-3.5 text-sm hover:bg-zinc-100 transition-colors"
          >
            Genera il mio profilo →
          </button>
        )}

        <p className="text-zinc-600 text-xs text-center">{footerNote}</p>
      </div>
    </main>
  )
}
