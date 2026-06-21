'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Experience {
  id: string
  role: string
  company: string
  sector: string
  years: number
  description: string | null
  position: number
}

interface Profile {
  id: string
  slug: string
  linkedin_url: string | null
  github_url: string | null
  website_url: string | null
  contact_email: string | null
  skills: string[] | null
}

// Simple skill tag input
function SkillsInput({ skills, onChange }: Readonly<{ skills: string[], onChange: (s: string[]) => void }>) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (!trimmed || skills.includes(trimmed) || skills.length >= 12) return
    onChange([...skills, trimmed])
    setInput('')
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {skills.map(s => (
          <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-zinc-300 text-xs">
            {s}
            <button type="button" onClick={() => onChange(skills.filter(x => x !== s))} className="text-zinc-500 hover:text-red-400 transition-colors leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Aggiungi skill e premi Invio"
          maxLength={30}
          disabled={skills.length >= 12}
          className="flex-1 bg-transparent border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors disabled:opacity-40"
        />
        <button type="button" onClick={add} disabled={!input.trim() || skills.length >= 12} className="px-3 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:text-zinc-200 disabled:opacity-30 transition-colors">
          +
        </button>
      </div>
      <p className="text-zinc-700 text-xs">{skills.length}/12 skills</p>
    </div>
  )
}

export default function EnrichPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [descriptions, setDescriptions] = useState<string[]>([])
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [website, setWebsite] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: p } = await supabase
        .from('profiles')
        .select('id, slug, linkedin_url, github_url, website_url, contact_email, skills')
        .eq('id', user.id)
        .single()

      const { data: exps } = await supabase
        .from('experiences')
        .select('id, role, company, sector, years, description, position')
        .eq('profile_id', user.id)
        .order('position')

      if (!p) { router.replace('/login'); return }

      setProfile(p)
      setLinkedin(p.linkedin_url ?? '')
      setGithub(p.github_url ?? '')
      setWebsite(p.website_url ?? '')
      setContactEmail(p.contact_email ?? '')
      setSkills(p.skills ?? [])

      const sortedExps = (exps ?? []) as Experience[]
      setExperiences(sortedExps)

      const existingDescriptions = sortedExps.map(e => e.description ?? '')
      const hasAnyDescription = existingDescriptions.some(d => d.length > 0)

      if (!hasAnyDescription && sortedExps.length > 0) {
        setGenerating(true)
        try {
          const res = await fetch('/api/generate-descriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ experiences: sortedExps }),
          })
          const { descriptions: generated } = await res.json()
          setDescriptions(generated.length ? generated : existingDescriptions)
        } catch {
          setDescriptions(existingDescriptions)
        } finally {
          setGenerating(false)
        }
      } else {
        setDescriptions(existingDescriptions)
      }
    }

    load()
  }, [router])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/save-enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          slug: profile.slug,
          linkedin_url: linkedin || null,
          github_url: github || null,
          website_url: website || null,
          contact_email: contactEmail || null,
          skills,
          experienceDescriptions: experiences.map((exp, i) => ({
            id: exp.id,
            description: descriptions[i] ?? '',
          })),
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }

      router.push(`/${profile.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio.')
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="max-w-lg mx-auto space-y-10">

        <div className="space-y-1">
          <h1 className="text-white text-2xl font-semibold tracking-tight">Completa il profilo</h1>
          <p className="text-zinc-400 text-sm">Tutti i campi sono opzionali. Aggiungi solo quello che vuoi mostrare.</p>
        </div>

        {/* Experience descriptions */}
        <section className="space-y-4">
          <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Descrizioni esperienze</h2>
          {generating ? (
            <div className="space-y-3">
              {experiences.map((_, i) => (
                <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
                  <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/3" />
                  <div className="h-16 bg-zinc-800 rounded animate-pulse" />
                </div>
              ))}
              <p className="text-zinc-600 text-xs text-center">Generazione descrizioni in corso…</p>
            </div>
          ) : (
            <div className="space-y-3">
              {experiences.map((exp, i) => (
                <div key={exp.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
                  <p className="text-white text-sm font-medium">{exp.role} <span className="text-zinc-500 font-normal">@ {exp.company}</span></p>
                  <textarea
                    value={descriptions[i] ?? ''}
                    onChange={e => {
                      const updated = [...descriptions]
                      updated[i] = e.target.value
                      setDescriptions(updated)
                    }}
                    rows={3}
                    placeholder="Descrizione del ruolo e dell'impatto…"
                    className="w-full bg-transparent border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors resize-none"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Contact links */}
        <section className="space-y-4">
          <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Contatti</h2>
          <div className="space-y-3">
            {[
              { label: 'LinkedIn', value: linkedin, set: setLinkedin, placeholder: 'https://linkedin.com/in/tuonome' },
              { label: 'GitHub', value: github, set: setGithub, placeholder: 'https://github.com/tuonome' },
              { label: 'Sito personale', value: website, set: setWebsite, placeholder: 'https://tuosito.com' },
              { label: 'Email pubblica', value: contactEmail, set: setContactEmail, placeholder: 'name@esempio.com' },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-zinc-500 text-xs w-24 shrink-0">{label}</span>
                <input
                  type="text"
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-4">
          <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Skills</h2>
          <SkillsInput skills={skills} onChange={setSkills} />
        </section>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || generating}
            className="flex-1 rounded-xl bg-white text-black font-medium py-3.5 text-sm disabled:opacity-40 hover:bg-zinc-100 transition-colors"
          >
            {saving ? 'Salvataggio…' : 'Salva e torna al profilo'}
          </button>
          <button
            onClick={() => profile && router.push(`/${profile.slug}`)}
            className="px-5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-zinc-200 hover:border-zinc-500 transition-colors"
          >
            Salta
          </button>
        </div>

      </div>
    </main>
  )
}
