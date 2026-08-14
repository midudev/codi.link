import { createConsoleBadge } from './constants/console-icons'
import { $ } from './utils/dom'
import { formatTable, formatValue } from './console/formatters.js'

const MAX_CONSOLE_LOGS = 200

const $iframe = $('iframe')
const $consoleList = $('#console .console-list')
const $consoleBadge = $('.console-badge-count')

let consoleLogCount = 0

const updateConsoleBadge = () => {
  if (consoleLogCount === 0) {
    $consoleBadge.setAttribute('hidden', '')
  } else {
    $consoleBadge.removeAttribute('hidden')
    $consoleBadge.textContent = consoleLogCount > 99 ? '+99' : consoleLogCount
  }
}

const clearConsole = () => {
  $consoleList.innerHTML = ''
  consoleLogCount = 0
  updateConsoleBadge()
}

export const resetConsoleBadge = () => {
  consoleLogCount = 0
  updateConsoleBadge()
}

const createListItem = (content, type) => {
  const $li = document.createElement('li')
  $li.classList.add(`log-${type.split(':')[1]}`)

  const badge = createConsoleBadge(type)
  if (badge) {
    $li.innerHTML = badge
  }

  const $pre = document.createElement('pre')
  $pre.style.whiteSpace = 'pre-wrap'
  $pre.style.margin = '0'

  $pre.innerHTML = content

  $li.appendChild($pre)

  return $li
}

const appendLogItem = (content, type, extraClass) => {
  const listItem = createListItem(content, type)
  if (extraClass) listItem.classList.add(extraClass)
  $consoleList.appendChild(listItem)
  consoleLogCount++

  while ($consoleList.childElementCount > MAX_CONSOLE_LOGS) {
    $consoleList.firstElementChild.remove()
  }

  updateConsoleBadge()
}

const handlers = {
  system: (payload) => {
    if (payload === 'clear') {
      clearConsole()
    }
  },
  error: (payload) => {
    const { line, column, message } = payload
    appendLogItem(`${line}:${column} ${message}`, 'error', 'error')
  },
  default: (payload, type) => {
    const content = type === 'log:table'
      ? payload.map(item => formatTable(item)).join(' ')
      : payload.map(item => formatValue(item)).join(' ')
    appendLogItem(content, type)
  },
  loop: (payload) => {
    clearConsole()
    appendLogItem(`${payload.message}`, 'error', 'error')
  }
}

window.addEventListener('message', (ev) => {
  const { console: consoleData = {} } = ev.data
  const { payload, type } = consoleData

  if (ev.source === $iframe.contentWindow) {
    const handler = handlers[type] || handlers.default
    handler(payload, type)
  } else if (type === 'loop') {
    handlers.loop(payload)
  }
})
