import { createConsoleBadge } from './constants/console-icons'
import { getState } from './state.js'
import { $ } from './utils/dom'
import { resolveLayoutType } from './utils/layout.js'
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

export const clearConsole = () => {
  $consoleList.innerHTML = ''
  consoleLogCount = 0
  updateConsoleBadge()
}

export const resetConsoleBadge = () => {
  consoleLogCount = 0
  updateConsoleBadge()
}

const revealJsLine = (line, column) => {
  const $script = $('#script')
  if (resolveLayoutType(getState().layout) === 'tabs') {
    document.querySelector('#tabs [for="script"]')?.click()
  }
  $script.editorHandle?.revealLine(line, column)
}

const createLocationButton = (location) => {
  if (!location?.line) return null

  const $loc = document.createElement('button')
  $loc.type = 'button'
  $loc.className = 'console-location'
  $loc.textContent = String(location.line)
  $loc.title = `JavaScript:${location.line}`
  $loc.dataset.line = String(location.line)
  if (location.column) $loc.dataset.column = String(location.column)
  return $loc
}

const createListItem = (content, type, location) => {
  const $li = document.createElement('li')
  $li.classList.add(`log-${type.split(':')[1]}`)

  const badge = createConsoleBadge(type)
  if (badge) {
    $li.innerHTML = badge
  }

  const $pre = document.createElement('pre')
  $pre.innerHTML = content

  $li.appendChild($pre)

  const $location = createLocationButton(location)
  if ($location) $li.appendChild($location)

  return $li
}

const appendLogItem = (content, type, extraClass, location) => {
  const listItem = createListItem(content, type, location)
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
  error: (payload, _type, location) => {
    const { line, column, message } = payload
    appendLogItem(message, 'error', 'error', location || { line, column })
  },
  default: (payload, type, location) => {
    const content = type === 'log:table'
      ? payload.map(item => formatTable(item)).join(' ')
      : payload.map(item => formatValue(item)).join(' ')
    appendLogItem(content, type, undefined, location)
  },
  loop: (payload) => {
    clearConsole()
    appendLogItem(`${payload.message}`, 'error', 'error')
  }
}

$consoleList.addEventListener('click', (ev) => {
  const $location = ev.target.closest('.console-location')
  if (!$location) return

  revealJsLine(
    Number($location.dataset.line),
    Number($location.dataset.column || 1)
  )
})

window.addEventListener('message', (ev) => {
  const { console: consoleData = {} } = ev.data
  const { payload, type, location } = consoleData

  if (ev.source === $iframe.contentWindow) {
    const handler = handlers[type] || handlers.default
    handler(payload, type, location)
  } else if (type === 'loop') {
    handlers.loop(payload)
  }
})
