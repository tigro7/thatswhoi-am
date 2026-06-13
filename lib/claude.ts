import Anthropic from '@anthropic-ai/sdk'
import type { Experience, Archetype } from './archetype'

const client = new Anthropic()

const archetypeContext: Record<Archetype, string> = {
  adapter: 'una persona con carriera trasversale in settori molto diversi, il cui valore è la capacità di connettere mondi che non si parlano',
  climber: 'una persona con progressione verticale chiara nello stesso settore, il cui valore è la profondità e la crescita continua',
  builder: 'una persona che ha costruito cose da zero in contesti diversi, il cui valore è l\'impatto concreto e la capacità di fare partire progetti',
}

export async function generateHeadline(
  experiences: Experience[],
  archetype: Archetype,
  totalYears: number
): Promise<string> {
  const expList = experiences
    .map(e => `- ${e.role} @ ${e.company} (${e.sector}, ${e.years} anni)`)
    .join('\n')

  const prompt = `Sei un copywriter esperto di personal branding professionale.

Genera UNA headline professionale per questa persona. La headline deve:
- Essere in prima persona implicita (non iniziare con "Sono" o "Ho")
- Essere autentica, non generica
- Evidenziare il valore unico di questa carriera specifica
- Essere tra 1 e 3 frasi brevi
- Essere in italiano
- NON usare buzzword come "appassionato", "dinamico", "proattivo"
- Riflettere che questa è ${archetypeContext[archetype]}

Esperienze:
${expList}

Anni totali di carriera: ${totalYears}

Rispondi SOLO con la headline, niente altro.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  return (message.content[0] as Anthropic.TextBlock).text.trim()
}
