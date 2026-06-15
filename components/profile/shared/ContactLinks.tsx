import type { ProfileData } from './types'

interface ContactLinksProps {
  profile: Pick<ProfileData, 'linkedin_url' | 'github_url' | 'website_url' | 'contact_email'>
}

export default function ContactLinks({ profile }: Readonly<ContactLinksProps>) {
  const contacts = [
    { label: 'LinkedIn', href: profile.linkedin_url },
    { label: 'GitHub', href: profile.github_url },
    { label: 'Sito', href: profile.website_url },
    { label: 'Email', href: profile.contact_email ? `mailto:${profile.contact_email}` : null },
  ].filter((c): c is { label: string; href: string } => Boolean(c.href))

  if (!contacts.length) return null

  return (
    <section className="space-y-3">
      <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Contatti</h2>
      <div className="flex flex-wrap gap-3">
        {contacts.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 text-sm hover:text-white transition-colors underline underline-offset-2"
          >
            {label}
          </a>
        ))}
      </div>
    </section>
  )
}
