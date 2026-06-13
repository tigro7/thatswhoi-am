'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  'Analizzo la tua carriera…',
  'Identifico il tuo archetipo…',
  'Scrivo la tua headline…',
  'Costruisco il profilo…',
]

export default function GeneratingScreen() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i < STEPS.length) {
        setCurrentStep(i)
      } else {
        clearInterval(interval)
      }
    }, 900)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-700" />
          <div className="absolute inset-0 rounded-full border-t-2 border-white animate-spin" />
        </div>

        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <p
              key={step}
              className={`text-sm transition-all duration-500 ${
                i < currentStep
                  ? 'text-zinc-600 line-through'
                  : i === currentStep
                  ? 'text-white'
                  : 'text-zinc-700'
              }`}
            >
              {i <= currentStep && '✓ '}{step}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
