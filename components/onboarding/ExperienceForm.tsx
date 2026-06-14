'use client'

import { useState, useEffect } from 'react'
import type { Experience } from '@/lib/archetype'

interface ExperienceFormProps {
  experiences: Experience[]
  onChange: (experiences: Experience[]) => void
}

const emptyDraft = (): Experience => ({ role: '', company: '', sector: '', years: 1 })

interface SectorBadgeProps {
  inferring: boolean
  activeSector: string
  sectorOverride: string | null
  editingSector: boolean
  onOverride: (v: string) => void
  onEditStart: () => void
  onEditEnd: () => void
}

function SectorBadge({ inferring, activeSector, sectorOverride, editingSector, onOverride, onEditStart, onEditEnd }: Readonly<SectorBadgeProps>) {
  if (inferring && !activeSector) {
    return <span className="text-zinc-600 text-xs">Identifico il settore…</span>
  }
  if (editingSector) {
    return (
      <input
        type="text"
        value={sectorOverride ?? activeSector}
        onChange={e => onOverride(e.target.value)}
        onBlur={onEditEnd}
        onKeyDown={e => { if (e.key === 'Enter') onEditEnd() }}
        autoFocus
        placeholder="Settore"
        className="bg-transparent border border-zinc-600 rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-zinc-400 w-36 transition-colors"
      />
    )
  }
  if (activeSector) {
    return (
      <>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-zinc-300 text-xs">
          {activeSector}
        </span>
        <button
          type="button"
          onClick={onEditStart}
          className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
        >
          Modifica
        </button>
      </>
    )
  }
  return null
}

function useSectorInference(company: string, role: string) {
  const [sector, setSector] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (company.trim().length < 2) { setSector(''); return }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/infer-sector', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company, role }),
        })
        const data = await res.json()
        setSector(data.sector || '')
      } catch {
        setSector('')
      } finally {
        setLoading(false)
      }
    }, 700)
    return () => clearTimeout(timer)
  }, [company, role])

  return { sector, loading, setSector }
}

export default function ExperienceForm({ experiences, onChange }: Readonly<ExperienceFormProps>) {
  const [draft, setDraft] = useState<Experience>(emptyDraft())
  const [adding, setAdding] = useState(experiences.length === 0)
  const [sectorOverride, setSectorOverride] = useState<string | null>(null)
  const [editingSector, setEditingSector] = useState(false)

  const { sector: inferredSector, loading: inferring } = useSectorInference(draft.company, draft.role)

  const activeSector = sectorOverride ?? inferredSector

  function handleAddExperience() {
    if (!draft.role || !draft.company || !activeSector) return
    onChange([...experiences, { ...draft, sector: activeSector }])
    setDraft(emptyDraft())
    setSectorOverride(null)
    setEditingSector(false)
    setAdding(false)
  }

  function removeExperience(index: number) {
    onChange(experiences.filter((_, i) => i !== index))
  }

  function handleCancel() {
    setDraft(emptyDraft())
    setSectorOverride(null)
    setEditingSector(false)
    setAdding(false)
  }

  const canAdd = draft.role.trim() && draft.company.trim() && activeSector.trim()

  return (
    <div className="space-y-3">
      {experiences.map((exp, i) => (
        <div key={`${exp.company}-${exp.role}`} className="flex items-start justify-between rounded-xl border border-zinc-700 bg-zinc-800/40 px-4 py-3">
          <div>
            <p className="text-white text-sm font-medium">{exp.role}</p>
            <p className="text-zinc-400 text-xs mt-0.5">
              {exp.company}
              <span className="mx-1.5 text-zinc-700">·</span>
              <span className="text-zinc-500">{exp.sector}</span>
              <span className="mx-1.5 text-zinc-700">·</span>
              {exp.years} {exp.years === 1 ? 'anno' : 'anni'}
            </p>
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

      {adding && (
        <div className="rounded-xl border border-zinc-600 bg-zinc-800/60 p-4 space-y-3">
          <input
            type="text"
            value={draft.role}
            onChange={e => setDraft(d => ({ ...d, role: e.target.value }))}
            placeholder="Ruolo (es. Product Manager)"
            className="w-full bg-transparent border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
          />
          <div className="relative">
            <input
              type="text"
              value={draft.company}
              onChange={e => {
                setDraft(d => ({ ...d, company: e.target.value }))
                setSectorOverride(null)
                setEditingSector(false)
              }}
              placeholder="Azienda"
              className="w-full bg-transparent border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
            />
            {inferring && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 border-t-zinc-300 animate-spin" />
              </div>
            )}
          </div>

          {/* Sector badge */}
          {draft.company.trim().length >= 2 && (
            <div className="flex items-center gap-2 min-h-[32px]">
              <SectorBadge
                inferring={inferring}
                activeSector={activeSector}
                sectorOverride={sectorOverride}
                editingSector={editingSector}
                onOverride={setSectorOverride}
                onEditStart={() => { setSectorOverride(activeSector); setEditingSector(true) }}
                onEditEnd={() => setEditingSector(false)}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <label htmlFor="exp-years" className="text-zinc-400 text-xs whitespace-nowrap">Anni:</label>
            <input
              id="exp-years"
              type="number"
              value={draft.years}
              min={0.5}
              max={50}
              step={0.5}
              onChange={e => setDraft(d => ({ ...d, years: Number.parseFloat(e.target.value) || 1 }))}
              className="w-20 bg-transparent border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAddExperience}
              disabled={!canAdd}
              className="flex-1 rounded-lg bg-zinc-700 text-white text-sm py-2.5 hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Aggiungi
            </button>
            {experiences.length > 0 && (
              <button
                onClick={handleCancel}
                className="px-4 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:text-zinc-200 transition-colors"
              >
                Annulla
              </button>
            )}
          </div>
        </div>
      )}

      {!adding && (
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
