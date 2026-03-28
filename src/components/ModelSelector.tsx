'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { detectProvider } from '@/lib/openrouter'
import { ChevronDown, Sparkles } from 'lucide-react'

interface ModelInfo {
  id: string
  name: string
  provider: string
  description: string
  context: string
}

// Pollinations AI models — short alias IDs (NOT 'org/model' style)
const POLLINATIONS_MODELS: ModelInfo[] = [
  { id: 'claude',           name: 'Claude 3.5 Sonnet',  provider: 'Anthropic', description: 'Reliable workhorse',          context: '200K' },
  { id: 'openai',           name: 'GPT-4o',              provider: 'OpenAI',    description: 'Flagship OpenAI model',       context: '128K' },
  { id: 'openai-large',     name: 'GPT-4o Large',        provider: 'OpenAI',    description: 'High-capacity reasoning',     context: '128K' },
  { id: 'openai-reasoning', name: 'o3',                  provider: 'OpenAI',    description: 'OpenAI reasoning model',      context: '128K' },
  { id: 'gemini',           name: 'Gemini Pro',           provider: 'Google',    description: 'Multimodal reasoning',        context: '1M'   },
  { id: 'gemini-thinking',  name: 'Gemini Thinking',     provider: 'Google',    description: 'Extended thinking',          context: '1M'   },
  { id: 'deepseek',         name: 'DeepSeek V3',          provider: 'DeepSeek',  description: 'Fast and capable',           context: '128K' },
  { id: 'deepseek-r1',      name: 'DeepSeek R1',          provider: 'DeepSeek',  description: 'Strong reasoning model',     context: '128K' },
  { id: 'llama',            name: 'LLaMA 3.3 70B',        provider: 'Meta',      description: 'Solid open-source model',   context: '128K' },
  { id: 'mistral',          name: 'Mistral Large',         provider: 'Mistral',   description: 'MoE powerhouse',            context: '128K' },
  { id: 'qwen-coder',       name: 'Qwen Coder 32B',       provider: 'Qwen',      description: 'Strong coding model',       context: '128K' },
  { id: 'phi',              name: 'Phi-4',                 provider: 'Microsoft', description: 'Compact and efficient',     context: '16K'  },
]

// OpenRouter models — org/model style IDs
const OPENROUTER_MODELS: ModelInfo[] = [
  { id: 'anthropic/claude-3.5-sonnet',        name: 'Claude 3.5 Sonnet',   provider: 'Anthropic', description: 'Reliable workhorse',        context: '200K' },
  { id: 'anthropic/claude-opus-4',            name: 'Claude Opus 4',       provider: 'Anthropic', description: 'Flagship model',            context: '200K' },
  { id: 'openai/gpt-4o',                      name: 'GPT-4o',              provider: 'OpenAI',    description: 'Reliable workhorse',        context: '128K' },
  { id: 'openai/gpt-4o-mini',                 name: 'GPT-4o Mini',         provider: 'OpenAI',    description: 'Fast & cheap',              context: '128K' },
  { id: 'google/gemini-2.5-pro',              name: 'Gemini 2.5 Pro',      provider: 'Google',    description: 'Strong reasoning + coding', context: '1M'   },
  { id: 'google/gemini-2.5-flash',            name: 'Gemini 2.5 Flash',    provider: 'Google',    description: 'Fast and efficient',        context: '1M'   },
  { id: 'deepseek/deepseek-chat',             name: 'DeepSeek V3',         provider: 'DeepSeek',  description: 'Fast and capable',          context: '128K' },
  { id: 'deepseek/deepseek-r1',               name: 'DeepSeek R1',         provider: 'DeepSeek',  description: 'Strong reasoning model',    context: '128K' },
  { id: 'meta-llama/llama-3.3-70b-instruct',  name: 'LLaMA 3.3 70B',      provider: 'Meta',      description: 'Solid all-rounder',         context: '128K' },
  { id: 'mistralai/mistral-large-2512',       name: 'Mistral Large 3',     provider: 'Mistral',   description: '675B MoE',                  context: '262K' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct',   name: 'Qwen 2.5 Coder 32B', provider: 'Qwen',      description: 'Strong coding model',       context: '131K' },
]

export function ModelSelector() {
  const defaultModel = useStore(s => s.defaultModel)
  const setDefaultModel = useStore(s => s.setDefaultModel)
  const apiKey = useStore(s => s.apiKey)
  const [isOpen, setIsOpen] = useState(false)

  const provider = detectProvider(apiKey || '')
  const models = provider === 'pollinations' ? POLLINATIONS_MODELS : OPENROUTER_MODELS

  // Find active model; fallback to first in current provider's list
  const activeModel = models.find(m => m.id === defaultModel) || models[0]

  const handleSelect = (modelId: string) => {
    setDefaultModel(modelId)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <label className="text-xs theme-secondary mb-1 block">Model</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2
          bg-theme-bg border border-theme-primary rounded-lg
          hover:glow-box transition-all text-sm"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="truncate">{activeModel.name}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleSelect(model.id)}
                className={`w-full flex items-start gap-3 px-3 py-3 text-left
                  hover:bg-theme-accent transition-colors
                  ${defaultModel === model.id ? 'bg-theme-accent' : ''}`}
              >
                <Sparkles className="w-4 h-4 mt-0.5 theme-secondary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{model.name}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-theme-accent rounded">
                      {model.context}
                    </span>
                  </div>
                  <div className="text-xs theme-secondary">
                    {model.provider} • {model.description}
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

export { POLLINATIONS_MODELS as MODELS }
