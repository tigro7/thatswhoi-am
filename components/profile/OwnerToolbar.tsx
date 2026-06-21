'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface OwnerToolbarProps {
  profileId: string
  slug: string
  isIncomplete: boolean
  isPrint: boolean
}

export default function OwnerToolbar({ profileId, slug, isIncomplete, isPrint }: Readonly<OwnerToolbarProps>) {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setIsOwner(user?.id === profileId)
    })
  }, [profileId])

  if (!isOwner || isPrint) return null

  return (
    <>
      {isIncomplete && (
        <div className="bg-zinc-900 border-b border-zinc-800">
          <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <p className="text-zinc-400 text-sm">Il tuo profilo è live. Aggiungi descrizioni, link e skills per renderlo ancora più completo.</p>
            <Link href="/enrich" className="shrink-0 rounded-lg bg-white text-black text-xs font-medium px-3 py-1.5 hover:bg-zinc-100 transition-colors">
              Completa →
            </Link>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto px-6 pt-4 flex justify-end">
        <a
          href={`/api/export-pdf/${slug}`}
          className="text-zinc-600 text-xs hover:text-zinc-300 transition-colors border border-zinc-800 rounded-lg px-3 py-1.5 hover:border-zinc-600"
        >
          Scarica PDF
        </a>
      </div>
    </>
  )
}
