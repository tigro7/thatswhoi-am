'use client'

import { useState } from 'react'
import type { Experience } from '@/lib/archetype'

interface ExperienceFormProps {
  experiences: Experience[]
  onChange: (experiences: Experience[]) => void
}

const SECTORS = [
  'Tech', 'Finanza', 'Healthcare', 'Marketing', 'Design', 'Retail',
  'Manifatturiero', 'Consulenza', 'Education', 'Media', 'Legale',
  'Immobiliare', 'Logistica', 'Energia', 'Pubblico', 'Altro',
]

const emptyExp = (): Experience => ({ role: '', company: '', sector: '', years: 1 })

export default function ExperienceForm({ experiences, onChange }: ExperienceFormProps) {
  const [draft, setDraft] = useState<Experience>(emptyExp())
  const [adding, setAdding] = useState(experiences.length === 0)

  function addExperience() {
    if (!draft.role || !draft.company || !draft.sector) return
    onChange([...experiences, draft])
    setDraft(emptyExp())
    setAdding(false)
  }

  function removeExperience(index: number) {
    onChange(experiences.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {experiences.map((exp, i) => (
        <div key={i} className="flex items-start justify-between rounded-xl border border-zinc-700 bg-zinc-800/40 px-4 py-3">
          <div>
            <p className="text-white text-sm font-medium">{exp.role}</p>
            <p className="text-zinc-400 text-xs mt-0.5">{exp.company} · {exp.sector} · {exp.years} {exp.years === 1 ? 'anno' : 'anni'}</p>
          </div>
          <button
            onClick={() => removeExperience(i)}
            className="text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none ml-3 mt-0.5"
            aria-label="Rimuovi"
          >
            ×
          </button>
        </div>
      ))}

      {adding ? (
        <div className="rounded-xl border border-zinc-600 bg-zinc-800/60 p-4 space-y-3">
          <input
            type="text"
            value={draft.role}
            onChange={e => setDraft(d => ({ ...d, role: e.target.value }))}
            placeholder="Ruolo (es. Product Manager)"
            className="w-full bg-transparent border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
          />
          <input
            type="text"
            value={draft.company}
            onChange={e => setDraft(d => ({ ...d, company: e.target.value }))}
            placeholder="Azienda"
            className="w-full bg-transparent border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
          />
          <select
            value={draft.sector}
            onChange={e => setDraft(d => ({ ...d, sector: e.target.value }))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-500 transition-colors text-white"
          >
            <option value="" disabled>Settore</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-3">
            <label className="text-zinc-400 text-xs whitespace-nowrap">Anni:</label>
            <input
              type="number"
              value={draft.years}
              min={0.5}
              max={50}
              step={0.5}
              onChange={e => setDraft(d => ({ ...d, years: parseFloat(e.target.value) || 1 }))}
              className="w-20 bg-transparent border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={addExperience}
              disabled={!draft.role || !draft.company || !draft.sector}
              className="flex-1 rounded-lg bg-zinc-700 text-white text-sm py-2.5 hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Aggiungi
            </button>
            {experiences.length > 0 && (
              <button
                onClick={() => setAdding(false)}
                className="px-4 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:text-zinc-200 transition-colors"
              >
                Annulla
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-xl border border-dashed border-zinc-700 text-zinc-500 text-sm py-3 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
        >
          + Aggiungi esperienza
        </button>
      )}
    </div>
  )
}
