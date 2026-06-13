import { NextRequest, NextResponse } from 'next/server'
import { generateHeadline } from '@/lib/claude'
import type { Experience, Archetype } from '@/lib/archetype'

export async function POST(req: NextRequest) {
  try {
    const { experiences, archetype, totalYears } = await req.json() as {
      experiences: Experience[]
      archetype: Archetype
      totalYears: number
    }

    if (!experiences?.length || !archetype || totalYears == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const headline = await generateHeadline(experiences, archetype, totalYears)
    return NextResponse.json({ headline })
  } catch (err) {
    console.error('generate-headline error:', err)
    return NextResponse.json({ error: 'Failed to generate headline' }, { status: 500 })
  }
}
