interface ImpactGridProps {
  totalYears: number
  companiesCount: number
  sectorsCount: number
}

export default function ImpactGrid({ totalYears, companiesCount, sectorsCount }: ImpactGridProps) {
  const stats = [
    { value: Math.round(totalYears), label: totalYears === 1 ? 'anno di carriera' : 'anni di carriera' },
    { value: companiesCount, label: companiesCount === 1 ? 'azienda' : 'aziende' },
    { value: sectorsCount, label: sectorsCount === 1 ? 'settore' : 'settori' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ value, label }) => (
        <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center">
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-zinc-500 text-xs mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}
