interface TimelineEntry {
  role: string
  company: string
  sector: string
  years: number
}

interface GrowthTimelineProps {
  experiences: TimelineEntry[]
}

export default function GrowthTimeline({ experiences }: GrowthTimelineProps) {
  const sorted = [...experiences].reverse()

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-0 bottom-0 w-px bg-zinc-700" />
      <div className="space-y-6">
        {sorted.map((exp, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-white ring-2 ring-zinc-900" />
            <p className="text-white text-sm font-medium">{exp.role}</p>
            <p className="text-zinc-400 text-xs mt-0.5">{exp.company} · {exp.years} {exp.years === 1 ? 'anno' : 'anni'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
