import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Experience {
  role: string
  company: string
  sector: string
  years: number
}

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    // Only authenticated users can generate descriptions (post-auth route)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { experiences } = await req.json() as { experiences: Experience[] }

    if (!experiences?.length) {
      return NextResponse.json({ descriptions: [] })
    }

    const expList = experiences
      .map((e, i) => `${i + 1}. ${e.role} @ ${e.company} (${e.sector}, ${e.years} ${e.years === 1 ? 'anno' : 'anni'})`)
      .join('\n')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Sei un copywriter esperto di personal branding professionale.

Per ciascuna delle seguenti esperienze lavorative, genera una descrizione di 1-2 frasi in stile CV professionale. Le descrizioni devono:
- Essere specifiche e concrete, mai generiche o buzzword-heavy
- Suggerire responsabilità e impatto plausibili per quel ruolo/settore/durata
- Essere in italiano
- Essere scritte come bozza che l'utente potrà editare — quindi plausibili ma senza inventare numeri o nomi specifici di progetti

Esperienze:
${expList}

Rispondi con SOLO un array JSON di stringhe nello stesso ordine delle esperienze, senza markdown. Esempio: ["descrizione 1", "descrizione 2"]`,
      }],
    })

    const text = (message.content[0] as Anthropic.TextBlock).text.trim()
    const descriptions: string[] = JSON.parse(text)
    return NextResponse.json({ descriptions })
  } catch (err) {
    console.error('generate-descriptions error:', err)
    return NextResponse.json({ descriptions: [] })
  }
}
