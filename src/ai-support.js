import { $ } from './utils/dom.js'

export const hasLanguageModel = () => 'LanguageModel' in globalThis

export async function isLanguageModelAvailable () {
  if (!hasLanguageModel()) return false

  try {
    const availability = await globalThis.LanguageModel.availability()
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
