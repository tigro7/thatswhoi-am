import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { company, role } = await req.json() as { company: string; role?: string }

    if (!company?.trim()) {
      return NextResponse.json({ error: 'Missing company' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 20,
      messages: [{
        role: 'user',
        content: `What is the industry sector of the company "${company.trim()}"${role ? ` (role: ${role.trim()})` : ''}? Reply with ONLY the sector name in Italian, max 2 words. Examples: Tech, Finanza, Healthcare, Consulting, Retail, Media, Energia, Logistica, Manifatturiero, Pubblico, Education, Legale, Immobiliare. If unknown, infer from the role.`,
      }],
    })

    const sector = (message.content[0] as Anthropic.TextBlock).text.trim()
    return NextResponse.json({ sector })
  } catch (err) {
    console.error('infer-sector error:', err)
    return NextResponse.json({ error: 'Failed to infer sector' }, { status: 500 })
  }
}
