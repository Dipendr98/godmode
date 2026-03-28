'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { ChevronDown, Zap, Sparkles } from 'lucide-react'

export function PersonaSelector() {
  const { personas, currentPersona, setCurrentPersona } = useStore()
  const [isOpen, setIsOpen] = useState(false)

  const activePersona = personas.find(p => p.id === currentPersona) || personas[0]

  const handleSelect = (id: string) => {
    setCurrentPersona(id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <label className="text-xs theme-secondary mb-1 block">Mode</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2
          bg-theme-bg border border-theme-primary rounded-lg
          hover:glow-box transition-all text-sm group"
        style={{
          borderColor: activePersona.color + '80',
          boxShadow: `0 0 10px ${activePersona.color}20`
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{activePersona.emoji}</span>
          <span className="font-semibold" style={{ color: activePersona.color }}>
            {activePersona.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 group-hover:animate-pulse" style={{ color: activePersona.color }} />
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 z-20
            bg-theme-dim border border-theme-primary rounded-lg
            shadow-lg max-h-80 overflow-y-auto"
          >
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`w-full flex items-start gap-3 px-3 py-3 text-left
                  hover:bg-theme-accent transition-colors
                  ${currentPersona === p.id ? 'bg-theme-accent' : ''}`}
              >
                <span className="text-lg mt-0.5">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: p.color }}>{p.name}</span>
                  </div>
                  <div className="text-xs theme-secondary line-clamp-2">
                    {p.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
