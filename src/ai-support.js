import { getState } from './state.js'
import { $ } from './utils/dom.js'

const MODEL_LANGUAGES = {
  en: 'en',
  es: 'es',
  pt: 'en'
}

export const hasLanguageModel = () => 'LanguageModel' in globalThis

export const getSessionOptions = () => {
  const language = MODEL_LANGUAGES[getState().language] ?? 'en'
  return {
    expectedInputs: [{ type: 'text', languages: [language] }],
    expectedOutputs: [{ type: 'text', languages: [language] }]
  }
}

export async function isLanguageModelAvailable () {
  if (!hasLanguageModel()) return false

  try {
    const availability = await globalThis.LanguageModel.availability(getSessionOptions())
    return availability !== 'unavailable'
  } catch {
    return false
  }
}

export async function revealAiChatButton () {
  if (!await isLanguageModelAvailable()) return

  const $button = $('[data-action="show-ai-chat-bar"]')
  $button?.removeAttribute('hidden')
}
