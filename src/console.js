import { CONSOLE_ICONS } from './constants/console-icons'
import { $ } from './utils/dom'

const $iframe = $('iframe')
const $consoleList = $('#console .console-list')

const clearConsole = () => {
  $consoleList.innerHTML = ''
}

const isValidIdentifier = (key) => /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(key)

const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const formatValue = (value, indentLevel = 0) => {
  const indent = '  '.repeat(indentLevel)

  if (value === null) {
    return '<span class="console-null">null</span>'
  }

  if (value === undefined) {
    return '<span class="console-undefined">undefined</span>'
  }

  if (typeof value === 'string') {
    return `<span class="console-string">"${escapeHtml(value)}"</span>`
  }

  if (typeof value === 'number') {
    return `<span class="console-number">${value}</span>`
  }

  if (typeof value === 'bigint') {
    return `<span class="console-number">${value}</span>`
  }

  if (typeof value === 'boolean') {
    return `<span class="console-boolean">${value}</span>`
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'

    let result = '[\n'

    value.forEach((item, index) => {
      result += `${indent}  ${formatValue(item, indentLevel + 1)}`
      if (index < value.length - 1) result += ','
      result += '\n'
    })

    result += `${indent}]`
    return result
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return '{}'

    let result = '{\n'

    keys.forEach((key, index) => {
      const renderedKey = isValidIdentifier(key)
        ? `<span class="console-key">${escapeHtml(key)}</span>`
        : `<span class="console-string">"${escapeHtml(key)}"</span>`

      result += `${indent}  ${renderedKey}: ${formatValue(value[key], indentLevel + 1)}`

      if (index < keys.length - 1) result += ','
      result += '\n'
    })

    result += `${indent}}`
    return result
  }

  return String(value)
}

const createListItem = (content, type) => {
  const $li = document.createElement('li')
  $li.classList.add(`log-${type.split(':')[1]}`)

  $li.innerHTML = CONSOLE_ICONS[type]

  const $pre = document.createElement('pre')
  $pre.style.whiteSpace = 'pre-wrap'
  $pre.style.margin = '0'

  $pre.innerHTML = content

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
    const content = payload.map(item => formatValue(item)).join(' ')
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
  const { console: consoleData = {} } = ev.data
  const { payload, type } = consoleData

  if (ev.source === $iframe.contentWindow) {
    const handler = handlers[type] || handlers.default
    handler(payload, type)
  } else if (type === 'loop') {
    handlers.loop(payload)
  }
})
