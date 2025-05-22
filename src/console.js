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

const formatValue = (value, indentLevel = 0) => {
  const indent = '  '.repeat(indentLevel)

  if (value === null) {
    return '<span class="console-null">null</span>'
  }

  if (value === undefined) {
    return '<span class="console-undefined">undefined</span>'
  }

  if (typeof value === 'string') {
    return `<span class="console-string">"${value.replace(/"/g, '\\"')}"</span>`
  }

  if (typeof value === 'number') {
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
      result += `${indent}  <span class="console-key">${key}</span>: ${formatValue(value[key], indentLevel + 1)}`
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

  const containsHtmlTags = (str) => {
    return typeof str === 'string' && /<[a-zA-Z][^>]*>/.test(str)
  }
  
  // Check if the content is formatted by formatValue function
  const isFormattedByFormatValue = (str) => {
    return typeof str === 'string' && str.includes('class="console-')
  }
  
  // innerHTML for formatValue-generated HTML, textContent otherwise
  if (typeof content === 'string') {
    if (isFormattedByFormatValue(content)) {
      // This is a string formatted by formatValue, render HTML tags
      $pre.innerHTML = content
    } else if (containsHtmlTags(content)) {
      // This is user content with HTML tags, escape it
      const tempDiv = document.createElement('div')
      tempDiv.textContent = content
      $pre.textContent = tempDiv.textContent
    } else if (content.includes('\n')) {
      // Multiline content
      $pre.textContent = content
    } else {
      $pre.textContent = content
    }
  } else {
    $pre.textContent = content
  }

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
    let content

    if (payload.length === 1 && typeof payload[0] === 'object' && payload[0] !== null) {
      content = formatValue(payload[0])
    } else if (payload.some(item => typeof item === 'object' && item !== null)) {
      content = payload.map(item => formatValue(item)).join(' ')
    } else {
      content = Number.isNaN(payload.find(isPrimitive)) || payload.find(isPrimitive)
        ? payload.join(' ')
        : payload.map(item => JSON.stringify(item)).join(' ')
    }

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
