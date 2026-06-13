'use client'

import { useState, useEffect, useCallback } from 'react'

interface SlugPickerProps {
  value: string
  onChange: (slug: string) => void
  status: SlugStatus
}

export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export function useSlugCheck(slug: string) {
  const [status, setStatus] = useState<SlugStatus>('idle')

  const check = useCallback(async (value: string) => {
    if (!value) { setStatus('idle'); return }
    setStatus('checking')
    try {
      const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(value)}`)
      const data = await res.json()
      let next: SlugStatus = 'taken'
      if (data.available) next = 'available'
      else if (data.reason === 'invalid') next = 'invalid'
      setStatus(next)
    } catch {
      setStatus('idle')
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => check(slug), 500)
    return () => clearTimeout(timer)
  }, [slug, check])

  return status
}

const statusMessage: Record<SlugStatus, string | null> = {
  idle: null,
  checking: 'Verifica in corso…',
  available: 'Disponibile',
  taken: 'Già preso, prova un altro',
  invalid: 'Almeno 3 caratteri: lettere, numeri, trattini, punti o underscore',
}

const statusColor: Record<SlugStatus, string> = {
  idle: 'text-zinc-500',
  checking: 'text-zinc-400',
  available: 'text-emerald-400',
  taken: 'text-red-400',
  invalid: 'text-amber-400',
}

export default function SlugPicker({ value, onChange, status }: Readonly<SlugPickerProps>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 focus-within:border-zinc-500 transition-colors">
        <span className="text-zinc-500 text-sm select-none whitespace-nowrap">thatswhoi.am/</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
          placeholder="iltuonome"
          maxLength={30}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-zinc-600 ml-0.5"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <p className={`text-xs h-4 ${statusColor[status]}`}>
        {statusMessage[status]}
      </p>
    </div>
  )
}
