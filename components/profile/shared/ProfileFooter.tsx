interface ProfileFooterProps {
  slug: string
  isPrint?: boolean
}

export default function ProfileFooter({ slug, isPrint }: Readonly<ProfileFooterProps>) {
  if (isPrint) return null

  return (
    <footer className="border-t border-zinc-800/60 pt-6 flex items-center justify-between">
      <p className="text-zinc-700 text-xs">thatswhoi.am/{slug}</p>
      <a href="/" className="text-zinc-700 text-xs hover:text-zinc-400 transition-colors">
        Crea il tuo profilo →
      </a>
    </footer>
  )
}
