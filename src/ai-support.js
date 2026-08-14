import { $ } from './utils/dom.js'

export const hasLanguageModel = () => 'LanguageModel' in globalThis

export function revealAiChatButton () {
  if (!hasLanguageModel()) return

  const $button = $('[data-action="show-ai-chat-bar"]')
  $button?.removeAttribute('hidden')
}
