import escapeHTML from 'escape-html'
import { getCurrentCode } from './events-controller.js'
import { getState } from './state.js'
import { $ } from './utils/dom.js'
import { getTranslation, translate } from './utils/translator.js'

const MODEL_LANGUAGES = {
  en: 'en',
  es: 'es',
  pt: 'en'
}

const MAX_SNIPPET = 3500

const $panel = $('#ai-chat')
const $status = $('.ai-chat-status', $panel)
const $list = $('.ai-chat-messages', $panel)
const $form = $('.ai-chat-form', $panel)
const $input = $('#ai-chat-input', $panel)
const $send = $('.ai-chat-send', $panel)
const $clear = $('.ai-chat-clear', $panel)

let session = null
let creating = null
let lastCodeKey = ''
let abortController = null
let streaming = false

const t = (key) => getTranslation(key, getState().language)

const clip = (code) => {
  const value = code ?? ''
  if (!value.trim()) return '(empty)'
  if (value.length <= MAX_SNIPPET) return value
  return `${value.slice(0, MAX_SNIPPET)}\n\n… [truncated]`
}

const getModelLanguage = () => MODEL_LANGUAGES[getState().language] ?? 'en'

const getSessionOptions = () => {
  const language = getModelLanguage()
  return {
    expectedInputs: [{ type: 'text', languages: [language] }],
    expectedOutputs: [{ type: 'text', languages: [language] }]
  }
}

const getSystemPrompt = () => {
  const language = getState().language
  const replyIn = {
    en: 'Reply in English.',
    es: 'Responde en español.',
    pt: 'Responde em português.'
  }[language] ?? 'Reply in English.'

  return [
    'You are a coding assistant inside codi.link, a live HTML, CSS and JavaScript playground.',
    'The user will share the current sandbox code. Use it to answer with concrete, practical help.',
    'Be concise. Prefer short explanations and relevant snippets over full files.',
    replyIn
  ].join(' ')
}

const setStatus = (key, vars = {}) => {
  let text = t(key)
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, value)
  })
  $status.textContent = text
  $status.hidden = !text
}

const formatMessage = (text) => {
  const escaped = escapeHTML(text)
  return escaped
    .replace(/```(?:\w+)?\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

const appendChunk = (current, chunk) => {
  if (!chunk) return current
  if (chunk.startsWith(current)) return chunk
  return current + chunk
}

const createMessage = (role, text = '') => {
  const $item = document.createElement('li')
  $item.className = `ai-chat-message is-${role}`

  const $role = document.createElement('strong')
  $role.textContent = role === 'user' ? t('aiChatYou') : t('aiChat')

  const $body = document.createElement('div')
  $body.className = 'ai-chat-message-body'
  $body.innerHTML = formatMessage(text)

  $item.append($role, $body)
  $list.appendChild($item)
  $item.scrollIntoView({ block: 'end' })
  return { $item, $body }
}

const setBusy = (isBusy) => {
  streaming = isBusy
  $input.disabled = isBusy
  $send.disabled = isBusy
}

const destroySession = () => {
  abortController?.abort()
  abortController = null
  session?.destroy?.()
  session = null
  creating = null
  lastCodeKey = ''
}

const ensureSession = async () => {
  if (session) return session
  if (creating) return creating

  const LanguageModel = globalThis.LanguageModel
  if (!LanguageModel) {
    setStatus('aiChatUnavailable')
    throw new Error('LanguageModel is not available')
  }

  creating = (async () => {
    const options = getSessionOptions()
    const availability = await LanguageModel.availability(options)

    if (availability === 'unavailable') {
      setStatus('aiChatUnavailable')
      throw new Error('LanguageModel unavailable')
    }

    abortController = new AbortController()

    const nextSession = await LanguageModel.create({
      ...options,
      initialPrompts: [{ role: 'system', content: getSystemPrompt() }],
      signal: abortController.signal,
      monitor (monitor) {
        monitor.addEventListener('downloadprogress', ({ loaded }) => {
          const percent = Math.round((loaded ?? 0) * 100)
          setStatus('aiChatDownloading', { percent })
        })
      }
    })

    session = nextSession
    setStatus('aiChatReady')
    return session
  })()

  try {
    return await creating
  } catch (error) {
    creating = null
    if (error?.name === 'AbortError') throw error
    setStatus('aiChatUnavailable')
    throw error
  }
}

const buildPrompt = (question) => {
  const { html, css, js } = getCurrentCode()
  const codeKey = `${html}\0${css}\0${js}`

  if (codeKey === lastCodeKey) return question
  lastCodeKey = codeKey

  return [
    'Current sandbox code:',
    '',
    'HTML:',
    clip(html),
    '',
    'CSS:',
    clip(css),
    '',
    'JavaScript:',
    clip(js),
    '',
    `Question: ${question}`
  ].join('\n')
}

const sendMessage = async (question) => {
  const trimmed = question.trim()
  if (!trimmed || streaming) return

  $input.value = ''
  createMessage('user', trimmed)
  const assistant = createMessage('assistant', '')
  assistant.$item.classList.add('is-pending')
  setBusy(true)
  setStatus('')

  try {
    const currentSession = await ensureSession()
    const stream = currentSession.promptStreaming(buildPrompt(trimmed), {
      signal: abortController?.signal
    })

    let text = ''
    for await (const chunk of stream) {
      text = appendChunk(text, chunk)
      assistant.$body.innerHTML = formatMessage(text)
      assistant.$item.scrollIntoView({ block: 'end' })
    }

    if (!text.trim()) {
      assistant.$body.innerHTML = formatMessage(t('aiChatError'))
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      assistant.$item.remove()
      return
    }

    console.error(error)
    assistant.$body.innerHTML = formatMessage(t('aiChatError'))
    if (error?.name === 'QuotaExceededError') {
      destroySession()
    }
  } finally {
    assistant.$item.classList.remove('is-pending')
    setBusy(false)
    $input.focus()
  }
}

const clearChat = () => {
  destroySession()
  $list.replaceChildren()
  setStatus('aiChatReady')
  $input.focus()
  ensureSession().catch(() => {})
}

$form.addEventListener('submit', (event) => {
  event.preventDefault()
  sendMessage($input.value)
})

$clear.addEventListener('click', (event) => {
  event.preventDefault()
  event.stopPropagation()
  clearChat()
})

$send.setAttribute('aria-label', t('aiChatSend'))
translate(getState().language)

ensureSession().catch(() => {})
