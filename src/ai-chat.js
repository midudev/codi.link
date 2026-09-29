import { getCurrentCode } from './events-controller.js'
import { getState } from './state.js'
import { $, $$ } from './utils/dom.js'
import { getTranslation, translate } from './utils/translator.js'
import { renderMarkdown, highlightCodeBlocks } from './ai-markdown.js'
import { executeEditorTool } from './ai-tools.js'

const MAX_HISTORY = 8
const MAX_ROUNDS = 8

const $panel = $('#ai-chat')
const $list = $('.ai-chat-messages', $panel)
const $form = $('.ai-chat-form', $panel)
const $input = $('#ai-chat-input', $panel)
const $send = $('.ai-chat-send', $panel)
const $clear = $('.ai-chat-clear', $panel)

const SEND_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></svg>'
const STOP_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" /></svg>'
const REMOVE_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>'

let abortController = null
let streaming = false
let history = []
let queue = []
let jumpNext = null
let stoppedByUser = false

const t = (key) => getTranslation(key, getState().language)

const getAiEndpoint = () => {
  const { hostname, protocol } = window.location
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'
  const isDesktop = protocol === 'codi:' || navigator.userAgent.includes('Electron')
  return isLocal || isDesktop ? 'https://codi.link/api/ai' : '/api/ai'
}

const COPY_ICON = '<svg class="ai-cb-copy-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" /></svg>'
const COPIED_ICON = '<svg class="ai-cb-copy-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 12.75 6 6 9-13.5" /></svg>'

const ORB_CELLS = Array.from({ length: 9 }, () => '<span class="ai-orb-cell"></span>').join('')

const estimateTokens = (value) => {
  const text = typeof value === 'string' ? value : ''
  if (!text) return 0
  return Math.ceil(text.length / 4)
}

const formatTokens = (value) => {
  const n = Math.max(0, Math.round(Number(value) || 0))
  if (n < 1000) return String(n)
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return `${Math.round(n / 1000)}k`
}

const estimatePromptTokens = (question, thread) => {
  const { html, css, js } = getCurrentCode()
  const historyText = (thread || []).map((item) => item.content || '').join('')
  return estimateTokens(html) + estimateTokens(css) + estimateTokens(js) + estimateTokens(question) + estimateTokens(historyText) + 400
}

const paintTokens = ($body, input, output) => {
  const $think = $('.ai-think', $body)
  const $in = $('[data-token="in"]', $body)
  const $out = $('[data-token="out"]', $body)
  if (!$think || !$in || !$out) return
  $in.textContent = formatTokens(input)
  $out.textContent = formatTokens(output)
  $think.setAttribute('aria-label', `${t('aiChatThinking')} ↑${formatTokens(input)} ↓${formatTokens(output)}`)
}

const showThinking = ($body, input = 0, output = 0) => {
  $body.innerHTML = `<span class="ai-think" role="status" aria-live="polite"><span class="ai-orb" aria-hidden="true"><span class="ai-orb-lattice">${ORB_CELLS}</span></span><span class="ai-think-tokens"><span class="ai-token is-in"><span class="ai-token-dir" aria-hidden="true">↑</span><span class="ai-token-n" data-token="in">${formatTokens(input)}</span></span><span class="ai-token is-out"><span class="ai-token-dir" aria-hidden="true">↓</span><span class="ai-token-n" data-token="out">${formatTokens(output)}</span></span></span></span>`
  paintTokens($body, input, output)
}

const localizeCodeBlocks = ($root) => {
  $$('.ai-cb-copy-label', $root).forEach(($label) => {
    $label.textContent = t('aiChatCopy')
  })
  $$('.ai-cb-copy', $root).forEach(($button) => {
    $button.setAttribute('aria-label', t('aiChatCopy'))
  })
}

const paintMarkdown = ($body, text, { streaming = false } = {}) => {
  $body.innerHTML = renderMarkdown(text) + (streaming ? '<span class="ai-caret is-steady"></span>' : '')
  localizeCodeBlocks($body)
}

const createMessage = (role, text = '') => {
  const $item = document.createElement('li')
  $item.className = `ai-chat-message is-${role}`

  const $role = document.createElement('strong')
  $role.textContent = role === 'user' ? t('aiChatYou') : t('aiChat')

  const $tools = document.createElement('ul')
  $tools.className = 'ai-tool-log'
  $tools.hidden = true

  const $body = document.createElement('div')
  $body.className = 'ai-chat-message-body'
  if (text) paintMarkdown($body, text)

  $item.append($role, $tools, $body)
  $list.appendChild($item)
  $item.scrollIntoView({ block: 'end' })
  return { $item, $body, $tools }
}

const syncSendState = () => {
  const hasText = Boolean($input.value.trim())
  const canStop = streaming && !hasText
  $send.classList.toggle('is-active', hasText || canStop)
  $send.classList.toggle('is-stop', canStop)
  $send.disabled = !hasText && !canStop
  $send.innerHTML = canStop ? STOP_ICON : SEND_ICON
  $send.setAttribute('aria-label', t(canStop ? 'aiChatStop' : 'aiChatSend'))
}

const syncClearState = () => {
  $clear.hidden = history.length === 0 && $list.childElementCount === 0 && queue.length === 0
}

const setBusy = (isBusy) => {
  streaming = isBusy
  syncSendState()
}

const createQueuedMessage = (text) => {
  const id = crypto.randomUUID()
  const message = createMessage('user', text)
  message.$item.classList.add('is-queued')
  message.$item.dataset.queueId = id
  message.$item.setAttribute('aria-label', t('aiChatQueued'))

  const $actions = document.createElement('div')
  $actions.className = 'ai-chat-queue-actions'

  const $remove = document.createElement('button')
  $remove.type = 'button'
  $remove.className = 'ai-chat-dequeue'
  $remove.dataset.translateAria = 'aiChatRemoveQueued'
  $remove.setAttribute('aria-label', t('aiChatRemoveQueued'))
  $remove.innerHTML = REMOVE_ICON

  const $jump = document.createElement('button')
  $jump.type = 'button'
  $jump.className = 'ai-chat-jump'
  $jump.dataset.translateAria = 'aiChatSendNow'
  $jump.setAttribute('aria-label', t('aiChatSendNow'))
  $jump.innerHTML = SEND_ICON

  $actions.append($remove, $jump)
  message.$item.append($actions)

  queue.push({ id, text, $item: message.$item })
  syncClearState()
  return id
}

const takeQueued = (id) => {
  const index = id
    ? queue.findIndex((item) => item.id === id)
    : 0
  if (index < 0 || !queue.length) return null

  const [item] = queue.splice(index, 1)
  item.$item.classList.remove('is-queued')
  item.$item.removeAttribute('aria-label')
  item.$item.removeAttribute('data-queue-id')
  $('.ai-chat-queue-actions', item.$item)?.remove()
  return item
}

const dropQueued = (id) => {
  const item = takeQueued(id)
  item?.$item.remove()
  syncClearState()
}

const processQueue = () => {
  if (streaming) return
  const next = jumpNext ?? takeQueued()
  jumpNext = null
  if (!next) return
  sendMessage(next.text, next.$item)
}

const renderAssistant = async ($body, text) => {
  paintMarkdown($body, text)
  await highlightCodeBlocks($body)
}

const LANG_LABEL = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JS'
}

const logTool = ($tools, name, args) => {
  const language = (args?.language || '').toLowerCase()
  const keys = {
    read_editor: 'aiChatToolRead',
    write_editor: 'aiChatToolWrite',
    replace_lines: 'aiChatToolReplace'
  }

  const $item = document.createElement('li')
  if (language) $item.dataset.lang = language

  const $action = document.createElement('span')
  $action.className = 'ai-tool-action'
  $action.textContent = t(keys[name] || 'aiChatToolRead')
  $item.append($action)

  if (language) {
    const $lang = document.createElement('span')
    $lang.className = 'ai-tool-logo'
    $lang.setAttribute('aria-label', LANG_LABEL[language] || language)
    $item.append($lang)
  }

  $tools.append($item)
  $tools.hidden = false
}

const parseToolArgs = (raw) => {
  try {
    return JSON.parse(raw || '{}')
  } catch {
    return {}
  }
}

const readSse = async (response, { onText, onUsage }) => {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let text = ''
  let toolCalls = []
  let sessionId = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (!data) continue

      let event
      try {
        event = JSON.parse(data)
      } catch {
        continue
      }

      if (event.type === 'session' && typeof event.id === 'string') {
        sessionId = event.id
      }
      if (event.type === 'usage') {
        onUsage?.(event.input, event.output)
      }
      if (event.type === 'text' && event.text) {
        text += event.text
        onText(text)
      }
      if (event.type === 'tool_calls' && Array.isArray(event.tool_calls)) {
        toolCalls = event.tool_calls
      }
    }
  }

  return { text, toolCalls, sessionId }
}

const MIN_REQUEST_INTERVAL_MS = 1000
let lastRequestAt = 0

const requestAi = async (payload, handlers) => {
  const now = Date.now()
  if (now - lastRequestAt < MIN_REQUEST_INTERVAL_MS) {
    const err = new Error('rate_limited')
    err.code = 'rate_limited'
    throw err
  }
  lastRequestAt = now

  const response = await fetch(getAiEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: abortController.signal,
    body: JSON.stringify({
      language: getState().language,
      ...payload
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const err = new Error(error.error || 'request_failed')
    err.code = error.error
    throw err
  }

  return readSse(response, handlers)
}

const sendMessage = async (question, $userItem) => {
  const trimmed = question.trim()
  if (!trimmed || streaming) return

  if ($userItem) {
    $list.appendChild($userItem)
  } else {
    $input.value = ''
    syncSendState()
    createMessage('user', trimmed)
  }

  const assistant = createMessage('assistant', '')
  assistant.$item.classList.add('is-pending')
  showThinking(assistant.$body, estimatePromptTokens(trimmed, history))
  setBusy(true)
  syncClearState()

  abortController?.abort()
  abortController = new AbortController()

  const messages = [
    ...history,
    { role: 'user', content: trimmed }
  ]

  let previewDirty = false
  const flushPreview = () => {
    if (!previewDirty) return
    previewDirty = false
    window.dispatchEvent(new CustomEvent('codi:preview-flush'))
  }

  try {
    let finalText = ''
    let sessionId = ''

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const payload = round === 0
        ? { question: trimmed, history, ...getCurrentCode() }
        : { messages, session: sessionId }

      if (round > 0 && !finalText) {
        showThinking(assistant.$body, estimatePromptTokens(trimmed, messages))
      }

      const { text, toolCalls, sessionId: nextSession } = await requestAi(payload, {
        onUsage: (input, output) => paintTokens(assistant.$body, input, output),
        onText: (chunk) => {
          paintMarkdown(assistant.$body, chunk, { streaming: true })
          assistant.$item.scrollIntoView({ block: 'end' })
        }
      })

      if (nextSession) sessionId = nextSession

      if (text) {
        finalText = text
        await renderAssistant(assistant.$body, text)
      }

      if (!toolCalls.length) break

      messages.push({
        role: 'assistant',
        content: text || '',
        tool_calls: toolCalls
      })

      for (const call of toolCalls) {
        const name = call.function?.name
        const args = parseToolArgs(call.function?.arguments)
        logTool(assistant.$tools, name, args)
        const result = await executeEditorTool(name, args)
        if (result?.mutated) previewDirty = true
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result)
        })
        assistant.$item.scrollIntoView({ block: 'end' })
      }

      flushPreview()
    }

    if (!finalText.trim() && assistant.$tools.hidden) {
      assistant.$body.innerHTML = renderMarkdown(t('aiChatError'))
    } else {
      if (!finalText.trim()) {
        finalText = t('aiChatApplied')
        await renderAssistant(assistant.$body, finalText)
      }

      history = [
        ...history,
        { role: 'user', content: trimmed },
        { role: 'assistant', content: finalText }
      ].slice(-MAX_HISTORY)
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      assistant.$item.remove()
    } else {
      console.error(error)
      const key = error?.code === 'rate_limit' ? 'aiChatRateLimit' : 'aiChatError'
      assistant.$body.innerHTML = renderMarkdown(t(key))
    }
  } finally {
    flushPreview()
    assistant.$item.classList.remove('is-pending')
    setBusy(false)
    abortController = null
    $input.focus()
  }

  if (stoppedByUser) {
    stoppedByUser = false
    return
  }

  processQueue()
}

const stopCurrent = () => {
  if (!streaming) return
  stoppedByUser = true
  jumpNext = null
  abortController?.abort()
}

const jumpQueued = (id) => {
  const item = takeQueued(id)
  if (!item) return

  if (!streaming) {
    sendMessage(item.text, item.$item)
    return
  }

  jumpNext = item
  abortController?.abort()
}

const clearChat = () => {
  jumpNext = null
  queue = []
  abortController?.abort()
  abortController = null
  history = []
  $list.replaceChildren()
  setBusy(false)
  syncClearState()
  $input.focus()
}

$form.addEventListener('submit', (event) => {
  event.preventDefault()
  const question = $input.value.trim()

  if (!question) {
    stopCurrent()
    return
  }

  if (streaming) {
    createQueuedMessage(question)
    $input.value = ''
    syncSendState()
    return
  }

  sendMessage(question)
})

$clear.addEventListener('click', (event) => {
  event.preventDefault()
  event.stopPropagation()
  clearChat()
})

translate(getState().language)
syncSendState()
syncClearState()

$input.addEventListener('input', syncSendState)

$list.addEventListener('click', async (event) => {
  const $queueButton = event.target.closest('.ai-chat-jump, .ai-chat-dequeue')
  if ($queueButton) {
    event.preventDefault()
    const id = $queueButton.closest('[data-queue-id]')?.dataset.queueId
    if (!id) return
    if ($queueButton.classList.contains('ai-chat-dequeue')) dropQueued(id)
    else jumpQueued(id)
    return
  }

  const $button = event.target.closest('.ai-cb-copy')
  if (!$button) return

  const $block = $button.closest('.ai-cb')
  const encoded = $block?.getAttribute('data-code') || ''
  let code
  try {
    code = decodeURIComponent(encoded)
  } catch {
    code = encoded
  }

  try {
    await navigator.clipboard.writeText(code)
  } catch {
    return
  }

  $button.innerHTML = `${COPIED_ICON}<span class="ai-cb-copy-label">${t('aiChatCopied')}</span>`
  $button.setAttribute('aria-label', t('aiChatCopied'))
  window.setTimeout(() => {
    $button.innerHTML = `${COPY_ICON}<span class="ai-cb-copy-label">${t('aiChatCopy')}</span>`
    $button.setAttribute('aria-label', t('aiChatCopy'))
  }, 1200)
})
