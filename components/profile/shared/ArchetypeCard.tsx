interface ArchetypeCardProps {
  icon: string
  name: string
  description: string
}

export default function ArchetypeCard({ icon, name, description }: Readonly<ArchetypeCardProps>) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <h3 className="text-white font-semibold text-sm">{name}</h3>
          <p className="text-zinc-400 text-sm mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </section>
  )
}
