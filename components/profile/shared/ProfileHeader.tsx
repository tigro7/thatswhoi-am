import type { ProfileData } from './types'

interface ProfileHeaderProps {
  profile: ProfileData
}

export default function ProfileHeader({ profile }: Readonly<ProfileHeaderProps>) {
  return (
    <header className="border-b border-zinc-800/60">
      <div className="max-w-2xl mx-auto px-6 py-8 flex items-start justify-between gap-6">
        <div className="space-y-2 flex-1">
          {profile.full_name && (
            <h1 className="text-2xl font-semibold tracking-tight text-white">{profile.full_name}</h1>
          )}
          <p className="text-zinc-300 text-base leading-relaxed">{profile.headline}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {profile.location && (
              <span className="text-zinc-500 text-xs">{profile.location}</span>
            )}
            {profile.is_open_to_work && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/40 border border-emerald-700/40 px-2.5 py-1 text-emerald-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Open to work</span>
              </span>
            )}
          </div>
        </div>
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || ''}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-zinc-700 flex-shrink-0"
          />
        )}
      </div>
    </header>
  )
}
