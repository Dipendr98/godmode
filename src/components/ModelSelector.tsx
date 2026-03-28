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

// Pollinations AI models — short alias IDs (updated to match Pollinations platform)
const POLLINATIONS_MODELS: ModelInfo[] = [
  // ── OpenAI ──────────────────────────────────────────────────────────
  { id: 'openai',           name: 'GPT-5 Mini',              provider: 'OpenAI',    description: 'Flagship GPT-5 mini',         context: '128K' },
  { id: 'openai-fast',      name: 'GPT-5 Nano',              provider: 'OpenAI',    description: 'Ultra-fast OpenAI model',     context: '128K' },
  { id: 'openai-large',     name: 'GPT-5.2',                 provider: 'OpenAI',    description: 'High-capacity reasoning',     context: '128K' },
  { id: 'openai-reasoning', name: 'o3',                      provider: 'OpenAI',    description: 'Advanced reasoning model',    context: '128K' },
  { id: 'openai-audio',     name: 'GPT-4o Mini Audio',       provider: 'OpenAI',    description: 'Multimodal audio support',    context: '128K' },
  // ── Anthropic ───────────────────────────────────────────────────────
  { id: 'claude',           name: 'Claude Sonnet 4.6',       provider: 'Anthropic', description: 'Best balance speed + quality',context: '200K' },
  { id: 'claude-fast',      name: 'Claude Haiku 4.5',        provider: 'Anthropic', description: 'Fast and efficient Claude',   context: '200K' },
  { id: 'claude-large',     name: 'Claude Opus 4.6',         provider: 'Anthropic', description: 'Most intelligent Claude',     context: '200K' },
  { id: 'claude-legacy',    name: 'Claude Opus 4.5',         provider: 'Anthropic', description: 'Previous flagship Claude',    context: '200K' },
  // ── Google ──────────────────────────────────────────────────────────
  { id: 'gemini',           name: 'Gemini 3 Flash',          provider: 'Google',    description: 'Fast Gemini 3 model',         context: '1M'   },
  { id: 'gemini-fast',      name: 'Gemini 2.5 Flash Lite',   provider: 'Google',    description: 'Lightest Gemini model',       context: '1M'   },
  { id: 'gemini-search',    name: 'Gemini 2.5 Flash Lite',   provider: 'Google',    description: 'Web-grounded search variant', context: '1M'   },
  { id: 'gemini-large',     name: 'Gemini 3.1 Pro',          provider: 'Google',    description: 'Frontier Gemini model',       context: '1M'   },
  { id: 'gemini-thinking',  name: 'Gemini 2.5 Pro Thinking', provider: 'Google',    description: 'Extended thinking model',     context: '1M'   },
  // ── xAI Grok ────────────────────────────────────────────────────────
  { id: 'grok',             name: 'xAI Grok 4.1 Fast',       provider: 'xAI',       description: 'Fast Grok model',             context: '128K' },
  { id: 'grok-reasoning',   name: 'Grok 4.1 Fast Reasoning', provider: 'xAI',       description: 'Reasoning-mode Grok',         context: '128K' },
  { id: 'grok-legacy',      name: 'xAI Grok 4 Fast',         provider: 'xAI',       description: 'Previous Grok fast model',    context: '128K' },
  // ── DeepSeek ────────────────────────────────────────────────────────
  { id: 'deepseek',         name: 'DeepSeek V3.2',           provider: 'DeepSeek',  description: 'GPT-5 class, ultra cheap',    context: '128K' },
  { id: 'deepseek-r1',      name: 'DeepSeek R1',             provider: 'DeepSeek',  description: 'Strong reasoning model',      context: '128K' },
  // ── Qwen / Alibaba ──────────────────────────────────────────────────
  { id: 'qwen-coder',       name: 'Qwen3 Coder 30B',         provider: 'Qwen',      description: 'Frontier coding model',       context: '128K' },
  { id: 'qwen-coder-large', name: 'Qwen3 Coder Next',        provider: 'Qwen',      description: 'Large frontier coder',        context: '128K' },
  { id: 'qwen-large',       name: 'Qwen3.5 Plus',            provider: 'Qwen',      description: 'Qwen flagship model',         context: '128K' },
  { id: 'qwen-vision',      name: 'Qwen3 VL Plus',           provider: 'Qwen',      description: 'Multimodal vision model',     context: '128K' },
  { id: 'qwen-safety',      name: 'Qwen3Guard 8B',           provider: 'Qwen',      description: 'Safety-focused small model',  context: '32K'  },
  // ── Mistral ─────────────────────────────────────────────────────────
  { id: 'mistral',          name: 'Mistral Small 3.2 24B',   provider: 'Mistral',   description: 'Fast updated Mistral Small',  context: '128K' },
  // ── Perplexity ──────────────────────────────────────────────────────
  { id: 'perplexity-fast',     name: 'Perplexity Sonar',         provider: 'Perplexity','description': 'Web-grounded fast answers', context: '128K' },
  { id: 'perplexity-reasoning',name: 'Perplexity Sonar Reasoning',provider:'Perplexity','description': 'Reasoning with web access',  context: '128K' },
  // ── Amazon ──────────────────────────────────────────────────────────
  { id: 'nova-fast',        name: 'Amazon Nova Micro',        provider: 'Amazon',    description: 'Ultra-fast compact model',    context: '128K' },
  { id: 'nova',             name: 'Amazon Nova 2 Lite',       provider: 'Amazon',    description: 'Balanced Nova model',         context: '128K' },
  // ── MiniMax ─────────────────────────────────────────────────────────
  { id: 'minimax',          name: 'MiniMax M2.5',             provider: 'MiniMax',   description: 'SWE-Bench leader, agentic',   context: '128K' },
  // ── Moonshot ────────────────────────────────────────────────────────
  { id: 'kimi',             name: 'Moonshot Kimi K2.5',       provider: 'Moonshot',  description: 'Native multimodal model',     context: '128K' },
  // ── Z.ai ────────────────────────────────────────────────────────────
  { id: 'glm',              name: 'Z.ai GLM-5',               provider: 'Z.ai',      description: 'Strong coding + agents',      context: '128K' },
  // ── Special / Community ─────────────────────────────────────────────
  { id: 'midijourney',      name: 'MIDIjourney',              provider: 'Pollinations','description': 'Music & creative tasks',    context: '8K'  },
  { id: 'polly',            name: 'Polly (Community)',         provider: 'Pollinations','description': 'Community model by Itachi', context: '8K'  },
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
