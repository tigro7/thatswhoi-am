'use client'

import { useMemo } from 'react'

interface Node {
  label: string
  x: number
  y: number
  r: number
}

interface SkillConstellationProps {
  sectors: string[]
  roles: string[]
}

function seededRandom(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) | 0
    return ((h >>> 0) / 0xffffffff)
  }
}

export default function SkillConstellation({ sectors, roles }: SkillConstellationProps) {
  const nodes: Node[] = useMemo(() => {
    const items = [...new Set([...sectors, ...roles])].slice(0, 9)
    const cx = 200
    const cy = 200
    const result: Node[] = [{ label: items[0] || '?', x: cx, y: cy, r: 38 }]
    const rand = seededRandom(items.join(''))

    for (let i = 1; i < items.length; i++) {
      const angle = (2 * Math.PI * i) / (items.length - 1)
      const dist = 80 + rand() * 40
      result.push({
        label: items[i],
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: 22 + rand() * 14,
      })
    }
    return result
  }, [sectors, roles])

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-xs mx-auto" aria-hidden>
      {/* Connection lines from center to outer nodes */}
      {nodes.slice(1).map((node, i) => (
        <line
          key={i}
          x1={nodes[0].x}
          y1={nodes[0].y}
          x2={node.x}
          y2={node.y}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}
      {/* Circles + labels */}
      {nodes.map((node, i) => (
        <g key={i}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={i === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.8)"
            fontSize={i === 0 ? 9 : 7}
            fontFamily="system-ui, sans-serif"
          >
            {node.label.length > 10 ? node.label.slice(0, 9) + '…' : node.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
