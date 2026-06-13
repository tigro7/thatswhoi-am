'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthGateProps {
  slug: string
  fullName: string
  onSuccess: (userId: string, userEmail: string) => void
}

export default function AuthGate({ slug, onSuccess }: Readonly<AuthGateProps>) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      if (data.user) onSuccess(data.user.id, email)
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }
      if (data.user) onSuccess(data.user.id, email)
    }

    setLoading(false)
  }

  const submitLabel = loading ? 'Attendere…' : mode === 'signup' ? 'Crea account e pubblica →' : 'Accedi e pubblica →'
  const signupTabClass = `flex-1 py-2.5 transition-colors ${mode === 'signup' ? 'bg-zinc-700 text-white' : 'bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'}`
  const loginTabClass = `flex-1 py-2.5 transition-colors ${mode === 'login' ? 'bg-zinc-700 text-white' : 'bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'}`

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
      </form>
    </div>
  )
}
