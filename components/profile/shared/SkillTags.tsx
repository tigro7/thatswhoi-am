interface SkillTagsProps {
  skills: string[] | null | undefined
  emphasis?: 'normal' | 'large'
}

export default function SkillTags({ skills, emphasis = 'normal' }: Readonly<SkillTagsProps>) {
  const filtered = skills?.filter(Boolean) ?? []
  if (!filtered.length) return null

  const tagClass = emphasis === 'large'
    ? 'rounded-full bg-zinc-800 border border-zinc-700 px-3.5 py-1.5 text-zinc-200 text-sm font-medium'
    : 'rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-zinc-300 text-xs'

  return (
    <section className="space-y-3">
      <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {filtered.map(s => (
          <span key={s} className={tagClass}>{s}</span>
        ))}
      </div>
    </section>
  )
}
