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

  const $pre = document.createElement('pre')
  $pre.style.whiteSpace = 'pre-wrap'
  $pre.style.margin = '0'
  $pre.textContent = content
  $li.appendChild($pre)

  return $li
}

const handlers = {
  system: (payload) => {
    if (payload === 'clear') {
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
    const content = Number.isNaN(payload.find(isPrimitive)) || payload.find(isPrimitive)
      ? payload.join(' ')
      : payload.map(item => JSON.stringify(item)).join(' ')

    const listItem = createListItem(content, type)
    $consoleList.appendChild(listItem)
  },
  loop: (payload) => {
    clearConsole()
    const { message } = payload
    const errorItem = createListItem(`${message}`, 'error')
    errorItem.classList.add('error')
    $consoleList.appendChild(errorItem)
  }
}

window.addEventListener('message', (ev) => {
  const { console: consoleData } = ev.data

  const payload = consoleData?.payload
  const type = consoleData?.type

  if (ev.source === $iframe.contentWindow) {
    const handler = handlers[type] || handlers.default
    handler(payload, type)
  } else if (type === 'loop') {
    handlers.loop(payload)
  }
})
