import { CONSOLE_ICONS } from './constants/console-icons'
import { $ } from './utils/dom'

const $iframe = $('iframe')
const $consoleList = $('#console .console-list')

const clearConsole = () => {
  $consoleList.innerHTML = ''
}

const isPrimitive = (item) => {
  return ['string', 'number', 'boolean', 'symbol', 'bigint'].includes(typeof item) || item === null || item === undefined
}

const createListItem = (content, type) => {
  const $li = document.createElement('li')
  $li.classList.add(`log-${type.split(':')[1]}`)

  $li.innerHTML = CONSOLE_ICONS[type]

  const $span = document.createElement('span')
  $span.textContent = content
  $li.appendChild($span)

  return $li
}

const handlers = {
  log: (payload) => {
    if (payload === 'Console connected') {
      clearConsole()
    }
  },
  error: (payload) => {
    const { line, column, message } = payload
    const errorItem = createListItem(`${line}:${column} ${message}`, 'error')
    errorItem.classList.add('error')
    $consoleList.appendChild(errorItem)
  },
  default: (payload, type) => {
    const content = payload.find(isPrimitive) ? payload.join(' ') : payload.map(item => JSON.stringify(item)).join(' ')
    const listItem = createListItem(content, type)
    $consoleList.appendChild(listItem)
  }
}

window.addEventListener('message', (ev) => {
  if (ev.source !== $iframe.contentWindow) return
  const { type, payload: rawPayload } = ev.data.console
  const payload = JSON.parse(rawPayload)

  const handler = handlers[type] || handlers.default
  handler(payload, type)
})
