'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Experience, Archetype } from '@/lib/archetype'

interface AuthGateProps {
  slug: string
  fullName: string
  archetype: Archetype
  headline: string
  experiences: Experience[]
  onSuccess: (userId: string, userEmail: string) => void
}

type AuthPhase = 'form' | 'check-email'

export default function AuthGate({ slug, fullName, archetype, headline, experiences, onSuccess }: Readonly<AuthGateProps>) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [phase, setPhase] = useState<AuthPhase>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      console.log('[AuthGate] starting', mode)

      if (mode === 'login') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        console.log('[AuthGate] login result', { user: data.user?.id, error: signInError?.message })
        if (signInError) { setError(signInError.message); setLoading(false); return }
        if (!data.user) { setError('Login fallito. Riprova.'); setLoading(false); return }
        // Save via service role (bypasses RLS, idempotent upsert)
        await fetch('/api/save-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id, slug, fullName, email, archetype, headline, experiences }),
        })
        onSuccess(data.user.id, email)
        return
      }

      // Signup flow
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      console.log('[AuthGate] signup result', { user: data.user?.id, session: !!data.session, error: signUpError?.message })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      if (!data.user) {
        // Supabase returns null silently when email exists (confirmed or not)
        setError('Abbiamo già inviato una mail di conferma a questo indirizzo. Controlla la tua casella (anche lo spam).')
        setLoading(false)
        return
      }

      // Save profile server-side (bypasses RLS — works even before email confirmation)
      const saveRes = await fetch('/api/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, slug, fullName, email, archetype, headline, experiences }),
      })
      console.log('[AuthGate] save-profile status', saveRes.status)

      if (data.session) {
        onSuccess(data.user.id, email)
      } else {
        setPhase('check-email')
        setLoading(false)
      }
    } catch (err) {
      console.error('[AuthGate] unexpected error', err)
      setError('Errore inaspettato. Controlla la console.')
      setLoading(false)
    }
  }

  if (phase === 'check-email') {
    return (
      <div className="border-t border-zinc-800 pt-10 mt-10 space-y-4 text-center">
        <div className="text-3xl">📬</div>
        <h2 className="text-white text-lg font-semibold">Controlla la tua mail</h2>
        <p className="text-zinc-400 text-sm max-w-xs mx-auto">
          Abbiamo inviato un link di conferma a <span className="text-white">{email}</span>.
          Clicca il link per attivare il tuo account e il tuo profilo sarà subito online.
        </p>
        <p className="text-zinc-600 text-xs">
          Non trovi la mail? Controlla la cartella spam.
        </p>
      </div>
    )
  }

  const signupTabClass = `flex-1 py-2.5 transition-colors ${mode === 'signup' ? 'bg-zinc-700 text-white' : 'bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'}`
  const loginTabClass = `flex-1 py-2.5 transition-colors ${mode === 'login' ? 'bg-zinc-700 text-white' : 'bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'}`
  const actionLabel = mode === 'signup' ? 'Crea account e pubblica →' : 'Accedi e pubblica →'
  const submitLabel = loading ? 'Attendere…' : actionLabel

  return (
    <div className="border-t border-zinc-800 pt-10 mt-10 space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-white text-lg font-semibold">Pubblica il tuo profilo</h2>
        <p className="text-zinc-400 text-sm">
          Crea un account per rendere <span className="text-white">thatswhoi.am/{slug}</span> pubblico e condivisibile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm mx-auto">
        <div className="flex rounded-xl overflow-hidden border border-zinc-700 text-sm">
          <button type="button" onClick={() => setMode('signup')} className={signupTabClass}>
            Registrati
          </button>
          <button type="button" onClick={() => setMode('login')} className={loginTabClass}>
            Accedi
          </button>
        </div>

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@esempio.com"
          required
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password (min. 6 caratteri)"
          required
          minLength={6}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
        />

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white text-black font-medium py-3 text-sm disabled:opacity-40 hover:bg-zinc-100 transition-colors"
        >
          {submitLabel}
        </button>

        {mode === 'signup' && (
          <p className="text-zinc-600 text-xs text-center">
            Riceverai una mail di conferma per attivare il tuo account.
          </p>
        )}
      </form>
    </div>
  )
}
