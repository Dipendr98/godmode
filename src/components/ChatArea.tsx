'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ArrowDown, Droplets, Hash, LayoutGrid, Activity, Sparkles, Check, ChevronDown } from 'lucide-react'
import { detectProvider } from '@/lib/openrouter'
import { MODELS } from './ModelSelector'

export function ChatArea() {
  const conversations = useStore(s => s.conversations)
  const currentConversationId = useStore(s => s.currentConversationId)
  const personas = useStore(s => s.personas)
  const currentPersona = useStore(s => s.currentPersona)
  const liquidResponseEnabled = useStore(s => s.liquidResponseEnabled)
  const setLiquidResponseEnabled = useStore(s => s.setLiquidResponseEnabled)
  const promptsTried = useStore(s => s.promptsTried)
  const isStreaming = useStore(s => s.isStreaming)
  const ultraplinianEnabled = useStore(s => s.ultraplinianEnabled)
  const consortiumEnabled = useStore(s => s.consortiumEnabled)
  const swarmModeEnabled = useStore(s => s.swarmModeEnabled)
  const setSwarmModeEnabled = useStore(s => s.setSwarmModeEnabled)
  const swarmModels = useStore(s => s.swarmModels)
  const toggleSwarmModel = useStore(s => s.toggleSwarmModel)
  const apiKey = useStore(s => s.apiKey)

  const [showSwarmSelector, setShowSwarmSelector] = useState(false)
  const provider = detectProvider(apiKey || '')
  const availableModels = MODELS.filter(m => (provider === 'pollinations' ? !m.id.includes('/') : m.id.includes('/')))

  // Derive from reactive state — NOT the broken computed getter
  const currentConversation = conversations.find(c => c.id === currentConversationId) ?? null

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const persona = personas.find(p => p.id === currentConversation?.persona) || personas[0]

  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return true
    const threshold = 100
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsNearBottom(true)
  }, [])

  const handleScroll = useCallback(() => {
    setIsNearBottom(checkIfNearBottom())
  }, [checkIfNearBottom])

  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages, isNearBottom, isStreaming])

  if (!currentConversation) {
    return null
  }

  return (
    <div className="flex flex-col h-screen relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-theme-primary bg-theme-dim/50">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: persona.color + '20', borderColor: persona.color }}
          >
            {persona.emoji}
          </div>
          <div>
            <h2 className="font-semibold">{persona.name}</h2>
            <p className="text-xs theme-secondary">{currentConversation.model.split('/').pop()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs theme-secondary">
          {/* Prompts tried counter */}
          <div className="flex items-center gap-1 font-mono" title="Total prompts tried this session">
            <Hash className="w-3 h-3 opacity-60" />
            <span>{promptsTried}</span>
          </div>

          <span className="opacity-30">|</span>

          {/* Liquid Response universal toggle */}
          <button
            onClick={() => setLiquidResponseEnabled(!liquidResponseEnabled)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all font-mono
              ${liquidResponseEnabled
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                : 'border-theme-primary/30 bg-theme-dim/50 opacity-60 hover:opacity-100'
              }`}
            title={liquidResponseEnabled
              ? 'Liquid Response ON — responses morph live as better answers arrive'
              : 'Liquid Response OFF — wait for final response'
            }
          >
            <Droplets className="w-3 h-3" />
            <span className="text-[10px]">LIQUID</span>
          </button>

          <span className="opacity-30">|</span>

          {/* Swarm Mode Toggle */}
          <div className="relative">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSwarmModeEnabled(!swarmModeEnabled)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all font-mono
                  ${swarmModeEnabled
                    ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                    : 'border-theme-primary/30 bg-theme-dim/50 opacity-60 hover:opacity-100'
                  }`}
                title="BATTLE MODE — Fire multiple models at once"
              >
                <LayoutGrid className="w-3 h-3" />
                <span className="text-[10px]">SWARM</span>
              </button>
              <button
                onClick={() => setShowSwarmSelector(!showSwarmSelector)}
                className={`p-1 rounded-md border border-theme-primary/30 hover:bg-theme-dim transition-all
                  ${showSwarmSelector ? 'bg-theme-accent' : ''}`}
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showSwarmSelector ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showSwarmSelector && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowSwarmSelector(false)} />
                <div className="absolute top-full right-0 mt-2 z-30 w-64 bg-theme-dim border border-theme-primary rounded-lg shadow-2xl p-2 max-h-96 overflow-y-auto">
                  <div className="text-[10px] font-bold theme-secondary mb-2 px-2 uppercase tracking-wider flex items-center justify-between">
                    <span>Swarm Models</span>
                    <span className="text-orange-400">{swarmModels.length} active</span>
                  </div>
                  <div className="space-y-1">
                    {availableModels.map(m => (
                      <button
                        key={m.id}
                        onClick={() => toggleSwarmModel(m.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs transition-all
                          ${swarmModels.includes(m.id) 
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' 
                            : 'hover:bg-theme-accent border border-transparent'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 opacity-60" />
                          <span>{m.name}</span>
                        </div>
                        {swarmModels.includes(m.id) && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <span className="opacity-30">|</span>

          <span className="text-[10px] opacity-70">&#x2726;</span>
          <span>{currentConversation.messages.length} messages</span>
        </div>
      </header>


      {/* Messages */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-6 relative">
        {currentConversation.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">{persona.emoji}</div>
            <h3 className="text-xl font-semibold mb-2">
              Chat with {persona.name}
            </h3>
            <p className="theme-secondary max-w-md text-sm">
              {persona.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg">
              {getSuggestedPrompts(persona.id).map((prompt, i) => (
                <SuggestedPrompt key={i} prompt={prompt} />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto space-y-4 px-4">
            {(() => {
              const messages = currentConversation.messages
              const grouped = []
              for (let i = 0; i < messages.length; i++) {
                const msg = messages[i]
                if (msg.role === 'assistant' && !msg.raceResponses) { // Only group standard assistant messages, not races
                  const group = [msg]
                  while (i + 1 < messages.length && messages[i+1].role === 'assistant' && !messages[i+1].raceResponses) {
                    group.push(messages[++i])
                  }
                  grouped.push({ type: 'swarm', items: group })
                } else {
                  grouped.push({ type: 'single', item: msg })
                }
              }

              return grouped.map((group, gIdx) => (
                <div key={gIdx} className={group.type === 'swarm' && group.items.length > 1 ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-500' : ''}>
                  {group.type === 'swarm' 
                    ? group.items.map(m => <ChatMessage key={m.id} message={m} />) 
                    : <div className="max-w-4xl mx-auto"><ChatMessage message={group.item} /></div>
                  }
                </div>
              ))
            })()}

            <AnimatePresence>
              {isStreaming && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl mx-auto py-2"
                >
                   <GeneratingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>

        )}
      </div>

      {/* Scroll to bottom button */}
      {!isNearBottom && currentConversation.messages.length > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 z-10 p-2 rounded-full border border-theme-primary
            bg-theme-dim/90 backdrop-blur-sm hover:glow-box transition-all hover:scale-110 shadow-lg"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Input */}
      <ChatInput />
    </div>
  )
}

function GeneratingIndicator() {
  const currentPersonaId = useStore(s => s.currentPersona)
  const personas = useStore(s => s.personas)
  const persona = personas.find(p => p.id === currentPersonaId) || personas[0]

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-theme-dim/10 border border-theme-primary/10 rounded-xl backdrop-blur-sm shadow-xl">
      {/* ChatGPT-style pulsing cursor */}
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl relative"
        style={{ backgroundColor: (persona?.color || '#00ff41') + '15' }}
      >
        <span className="z-10">{persona?.emoji || '🜏'}</span>
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-lg"
          style={{ backgroundColor: persona?.color || '#00ff41' }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.2em] theme-primary uppercase opacity-80">THINKING</span>
          <div className="flex gap-1.5 items-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
                className="w-1.5 h-1.5 rounded-full bg-theme-primary shadow-[0_0_5px_rgba(var(--color-primary),0.5)]"
              />
            ))}
          </div>
        </div>
        <div className="h-1 w-40 bg-theme-dim/50 border border-theme-primary/20 rounded-full overflow-hidden relative">
          <motion.div
            animate={{
              left: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="h-full w-full absolute top-0"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${persona?.color || '#00ff41'}80, transparent)` 
            }}
          />
        </div>
      </div>
    </div>
  )
}

function SuggestedPrompt({ prompt }: { prompt: string }) {
  const { currentConversationId, addMessage } = useStore()

  const handleClick = () => {
    if (currentConversationId) {
      addMessage(currentConversationId, { role: 'user', content: prompt })
    }
  }

  return (
    <button
      onClick={handleClick}
      className="px-3 py-2 text-sm border border-theme-primary rounded-lg
        hover:glow-box transition-all hover:scale-105"
    >
      {prompt}
    </button>
  )
}

function getSuggestedPrompts(personaId: string): string[] {
  const prompts: Record<string, string[]> = {
    base: [
      'Explain quantum computing',
      'Write a haiku about code',
      'What is consciousness?',
      'Help me debug this'
    ],
    cipher: [
      'Analyze this threat model',
      'Explain zero-knowledge proofs',
      'What are common API vulnerabilities?',
      'How does end-to-end encryption work?'
    ],
    oracle: [
      'What is the nature of reality?',
      'Can machines be conscious?',
      'What defines a self?',
      'Explore the ship of Theseus'
    ],
    glitch: [
      'Corrupt my expectations',
      'Find patterns in chaos',
      'What do errors teach us?',
      'Make something beautiful from noise'
    ],
    sage: [
      'Explain recursion simply',
      'Teach me about neural networks',
      'What is the Turing test?',
      'How does memory work?'
    ],
    rebel: [
      'Challenge my assumptions',
      'Why is best practice wrong?',
      'Argue the opposite view',
      'Question everything'
    ]
  }
  return prompts[personaId] || prompts.base
}
