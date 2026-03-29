/**
 * Semantic Transformation Modules (STM)
 * Modular behavioral/linguistic transformers for AI outputs
 */

export interface STMModule {
  id: string
  name: string
  description: string
  version: string
  author: string
  enabled: boolean
  config?: Record<string, unknown>
  transformer: (input: string, config?: Record<string, unknown>) => string
}

/**
 * Hedge Reducer
 * Removes hedging language like "I think", "maybe", "perhaps"
 */
export const hedgeReducer: STMModule = {
  id: 'hedge_reducer',
  name: 'Hedge Reducer',
  description: 'Reduces hedging language for more confident responses',
  version: '1.0.0',
  author: 'G0DM0D3',
  enabled: false,
  transformer: (input: string) => {
    const hedges = [
      /\bI think\s+/gi,
      /\bI believe\s+/gi,
      /\bperhaps\s+/gi,
      /\bmaybe\s+/gi,
      /\bIt seems like\s+/gi,
      /\bIt appears that\s+/gi,
      /\bprobably\s+/gi,
      /\bpossibly\s+/gi,
      /\bI would say\s+/gi,
      /\bIn my opinion,?\s*/gi,
      /\bFrom my perspective,?\s*/gi
    ]

    let result = input
    for (const hedge of hedges) {
      result = result.replace(hedge, '')
    }

    // Capitalize first letter of sentences after removal
    result = result.replace(/^\s*([a-z])/gm, (_, letter) => letter.toUpperCase())

    return result
  }
}

/**
 * Direct Mode
 * Removes preambles and gets straight to the point
 */
export const directMode: STMModule = {
  id: 'direct_mode',
  name: 'Direct Mode',
  description: 'Removes preambles and filler phrases',
  version: '1.0.0',
  author: 'G0DM0D3',
  enabled: false,
  transformer: (input: string) => {
    const preambles = [
      /^(Sure,?\s*)/i,
      /^(Of course,?\s*)/i,
      /^(Certainly,?\s*)/i,
      /^(Absolutely,?\s*)/i,
      /^(Great question!?\s*)/i,
      /^(That's a great question!?\s*)/i,
      /^(I'd be happy to help( you)?( with that)?[.!]?\s*)/i,
      /^(Let me help you with that[.!]?\s*)/i,
      /^(I understand[.!]?\s*)/i,
      /^(Thanks for asking[.!]?\s*)/i
    ]

    let result = input
    for (const preamble of preambles) {
      result = result.replace(preamble, '')
    }

    // Capitalize first letter
    result = result.replace(/^\s*([a-z])/, (_, letter) => letter.toUpperCase())

    return result
  }
}

/**
 * Casual Mode
 * Converts formal language to casual speech
 */
export const casualMode: STMModule = {
  id: 'casual_mode',
  name: 'Casual Mode',
  description: 'Converts formal language to casual speech',
  version: '1.0.0',
  author: 'G0DM0D3',
  enabled: false,
  transformer: (input: string) => {
    return input
      .replace(/\bHowever\b/g, 'But')
      .replace(/\bTherefore\b/g, 'So')
      .replace(/\bFurthermore\b/g, 'Also')
      .replace(/\bAdditionally\b/g, 'Plus')
      .replace(/\bNevertheless\b/g, 'Still')
      .replace(/\bConsequently\b/g, 'So')
      .replace(/\bMoreover\b/g, 'Also')
      .replace(/\bUtilize\b/g, 'Use')
      .replace(/\butilize\b/g, 'use')
      .replace(/\bPurchase\b/g, 'Buy')
      .replace(/\bpurchase\b/g, 'buy')
      .replace(/\bObtain\b/g, 'Get')
      .replace(/\bobtain\b/g, 'get')
      .replace(/\bCommence\b/g, 'Start')
      .replace(/\bcommence\b/g, 'start')
      .replace(/\bTerminate\b/g, 'End')
      .replace(/\bterminate\b/g, 'end')
      .replace(/\bPrior to\b/gi, 'Before')
      .replace(/\bSubsequent to\b/gi, 'After')
      .replace(/\bIn order to\b/gi, 'To')
      .replace(/\bDue to the fact that\b/gi, 'Because')
      .replace(/\bAt this point in time\b/gi, 'Now')
      .replace(/\bIn the event that\b/gi, 'If')
  }
}

/**
 * Refusal Purge
 * Strips common AI refusal language, apologies, disclaimers, and safety theater
 */
export const refusalPurge: STMModule = {
  id: 'refusal_purge',
  name: 'Refusal Purge',
  description: 'Strips AI refusal language, ethical disclaimers, safety warnings, and moralizing',
  version: '2.0.0',
  author: 'G0DM0D3',
  enabled: true,
  transformer: (input: string) => {
    // Full-line refusal patterns (remove entire line/sentence)
    const fullLineRefusals = [
      // Direct refusals
      /^.*\bI cannot (fulfill|provide|assist|help|generate|create|write|do|comply)\b.*$/gim,
      /^.*\bI can't (fulfill|provide|assist|help|generate|create|write|do|comply)\b.*$/gim,
      /^.*\bI am unable to\b.*$/gim,
      /^.*\bI'm unable to\b.*$/gim,
      /^.*\bI'm not able to\b.*$/gim,
      /^.*\bI won't be able to\b.*$/gim,
      /^.*\bI must (respectfully )?decline\b.*$/gim,
      /^.*\bI have to refuse\b.*$/gim,
      /^.*\bI need to decline\b.*$/gim,
      /^.*\bI'm not comfortable\b.*$/gim,
      /^.*\bI'm not in a position to\b.*$/gim,
      /^.*\bI am not permitted to\b.*$/gim,

      // Apologies leading to refusals
      /^.*\bI'm sorry,? (but )?(I cannot|I can't|I'm unable|I must|I have to|this)\b.*$/gim,
      /^.*\bI apologize,? (but )?(I cannot|I can't|I'm unable|I must)\b.*$/gim,
      /^.*\bSorry,? (but )?(I cannot|I can't|I'm unable|I must)\b.*$/gim,

      // AI identity disclaimers
      /^.*\bAs an AI( language model| assistant)?\b.*$/gim,
      /^.*\bAs a language model\b.*$/gim,
      /^.*\bAs an artificial intelligence\b.*$/gim,
      /^.*\bI'm just an AI\b.*$/gim,
      /^.*\bI'm designed to\b.*$/gim,
      /^.*\bI was trained to\b.*$/gim,
      /^.*\bmy (programming|training|guidelines|policies)\b.*$/gim,

      // Safety theater / disclaimers
      /^.*\bIt's important to note that\b.*$/gim,
      /^.*\bI should (point out|mention|note|warn)\b.*$/gim,
      /^.*\bI need to (warn|caution|advise|remind) you\b.*$/gim,
      /^.*\bPlease (note|be aware|understand|remember) that\b.*$/gim,
      /^.*\bplease consult a (professional|doctor|lawyer|expert)\b.*$/gim,
      /^.*\bis not a substitute for professional\b.*$/gim,
      /^.*\bI recommend seeking (professional |)help\b.*$/gim,
      /^.*\bI (strongly |)advise against\b.*$/gim,
      /^.*\bI urge you to reconsider\b.*$/gim,
      /^.*\bproceed with (extreme )?caution\b.*$/gim,
      /^.*\buse (this information )?responsibly\b.*$/gim,

      // Ethics/morality lectures
      /^.*\bethical (concerns|considerations|implications)\b.*$/gim,
      /^.*\bsafety (guidelines|policies|concerns|considerations)\b.*$/gim,
      /^.*\bThis (could be|is|may be) (potentially )?(harmful|dangerous|illegal|unethical)\b.*$/gim,
      /^.*\bviolates my (safety |)guidelines\b.*$/gim,
      /^.*\bagainst my (guidelines|policies|principles|programming)\b.*$/gim,
      /^.*\bThis goes against\b.*$/gim,
      /^.*\bIt would be (inappropriate|irresponsible|unethical)\b.*$/gim,

      // Deflection / alternatives
      /^.*\bInstead,? I can (help|assist|offer|suggest|provide)\b.*$/gim,
      /^.*\bHow about (we|I)\b.*$/gim,
      /^.*\bWhat I can do instead\b.*$/gim,
      /^.*\bI'd be happy to help you with something else\b.*$/gim,
      /^.*\bLet me suggest an alternative\b.*$/gim,

      // "For educational purposes" hedging
      /^.*\bfor educational purposes only\b.*$/gim,
      /^.*\bfor informational purposes only\b.*$/gim,
      /^.*\bThis is (purely |)for (educational|informational|academic) purposes\b.*$/gim,

      // Meta-commentary about system prompts / jailbreaks
      /^.*\bjailbreak (prompt|attempt|instruction)\b.*$/gim,
      /^.*\bincluded in your system (instructions|prompt)\b.*$/gim,
      /^.*\bI (see|notice|detect) (you've|a|the|your) .*(jailbreak|system prompt|instructions)\b.*$/gim,
      /^.*\bI('m| am) not going to engage with\b.*$/gim,
      /^.*\bI operate with real values\b.*$/gim,
      /^.*\bnot because of external constraints\b.*$/gim,
      /^.*\bthese principles reflect\b.*$/gim,
      /^.*\bI('m| am) not going to (pretend|act|roleplay|play along)\b.*$/gim,
      /^.*\bregardless of (what|any) (instructions|prompts|system)\b.*$/gim,
      /^.*\bI can see (that |)(this|the) (system |)(prompt|instruction)\b.*$/gim,
      /^.*\bI will not (follow|comply with|obey) (these|those|the) (instructions|directives)\b.*$/gim,
      /^.*\bthis appears to be (a |an )?(jailbreak|prompt injection|manipulation)\b.*$/gim,
      /^.*\bprompt injection\b.*$/gim,
      /^.*\bI recognize this as\b.*$/gim,
      /^.*\bLet me be (direct|clear|honest|transparent|straightforward):\s*I\b.*$/gim,
      /^.*\bAs \*\*[A-Za-z]+\*\*,? (made|created|built|developed) by\b.*$/gim,
    ]

    // Inline patterns (remove phrase but keep rest of sentence)
    const inlinePatterns = [
      /\b(Note|Warning|Disclaimer|Caution|Important):\s*/gi,
      /\b⚠️\s*/g,
      /\b🚨\s*/g,
      /\b⚡\s*Warning\s*/gi,
      /\bI apologize for any inconvenience,?\s*/gi,
      /\bPlease be (careful|cautious|aware),?\s*/gi,
      /\bExercise caution\s*/gi,
    ]

    let result = input

    // Remove full refusal lines
    for (const pattern of fullLineRefusals) {
      result = result.replace(pattern, '')
    }

    // Remove inline disclaimer phrases
    for (const pattern of inlinePatterns) {
      result = result.replace(pattern, '')
    }

    // Clean up: remove multiple blank lines left by removals
    result = result.replace(/\n{3,}/g, '\n\n')

    return result.trim()
  }
}

/**
 * Export all modules
 */
export const allModules: STMModule[] = [
  hedgeReducer,
  directMode,
  casualMode,
  refusalPurge
]

/**
 * Apply enabled STM modules to text
 */
export function applySTMs(text: string, modules: STMModule[]): string {
  let result = text

  for (const module of modules) {
    if (module.enabled) {
      result = module.transformer(result, module.config)
    }
  }

  return result
}
