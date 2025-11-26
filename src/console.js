import { createConsoleBadge } from './constants/console-icons'
import { $ } from './utils/dom'

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

const isValidIdentifier = (key) => /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(key)

const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const formatTable = (data) => {
  if (!data || typeof data !== 'object') {
    return formatValue(data)
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return '[]'

    // Check if array contains objects with similar keys
    const firstItem = data[0]
    if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
      const keys = Object.keys(firstItem)
      let table = '<div class="console-table">'
      table += '<table><thead><tr><th>(index)</th>'
      keys.forEach(key => {
        table += `<th>${escapeHtml(key)}</th>`
      })
      table += '</tr></thead><tbody>'

      data.forEach((item, index) => {
        table += `<tr><td>${index}</td>`
        keys.forEach(key => {
          const value = item[key]
          table += `<td>${formatValue(value)}</td>`
        })
        table += '</tr>'
      })

      table += '</tbody></table></div>'
      return table
    }

    // Simple array
    let table = '<div class="console-table"><table><thead><tr><th>(index)</th><th>Value</th></tr></thead><tbody>'
    data.forEach((item, index) => {
      table += `<tr><td>${index}</td><td>${formatValue(item)}</td></tr>`
    })
    table += '</tbody></table></div>'
    return table
  }

  // Object
  const keys = Object.keys(data)
  if (keys.length === 0) return '{}'

  let table = '<div class="console-table"><table><thead><tr><th>(index)</th><th>Value</th></tr></thead><tbody>'
  keys.forEach(key => {
    table += `<tr><td>${escapeHtml(key)}</td><td>${formatValue(data[key])}</td></tr>`
  })
  table += '</tbody></table></div>'
  return table
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
    if (value && value.type === 'function') {
      const fnContent = escapeHtml(value.content)
      const startOfBody = fnContent.indexOf('{')

      const isAsync = value.async
      const isGenerator = value.generator

      let className = 'console-fn'
      if (isAsync) {
        className += ' console-async-fn'
      }
      if (isGenerator) {
        className += ' console-generator-fn'
      }

      // Function signature logic
      let signature
      if (startOfBody === -1) {
        signature = fnContent.trim()
      } else {
        signature = fnContent.substring(0, startOfBody).trim()
      }

      signature = signature
        .replace(/^async\s+/, '')
        .replace(/^function\s*\*\s*/, '')
        .replace(/^function\s*/, '')
        .trim()

      // Function body logic
      let functionBody
      if (startOfBody === -1) {
        functionBody = ''
      } else {
        const bodyContent = fnContent.substring(startOfBody + 1, fnContent.lastIndexOf('}'))
        const compressedBody = bodyContent.trim().length > 0 ? '...' : ''
        functionBody = ` {${compressedBody}}`
      }

      return `<span class="${className}">${signature}${functionBody}</span>`
    }

    if (value && value.type === 'circular') {
      return '<span>[Circular]</span>'
    }

    if (value && value.type === 'regexp') {
      return `<span class="console-regexp">${escapeHtml(value.value)}</span>`
    }

    if (value && value.type === 'unknown') {
      return `<span>${escapeHtml(String(value.value))}</span>`
    }

    if (value && value.type === 'date') {
      const isoString = value.value
      const cleanedString = isoString
        .replace('T', ' ')
        .replace(/\.\d{3}Z$/, '')

      return `<span class="console-date">${escapeHtml(cleanedString)}</span>`
    }

    if (value && value.type === 'set') {
      const short = `Set(${value.size})`

      if (value.size === 0) return `<span>${short} {}</span>`

      let result = `<span>${short} {\n`

      ;(value.values || []).forEach((v, index) => {
        result += `${indent}  ${formatValue(v, indentLevel + 1)}`
        if (index < value.values.length - 1) result += ','
        result += '\n'
      })

      result += `${indent}}</span>`
      return result
    }

    const isSymbolKey = (k) => typeof k === 'string' && k.startsWith('Symbol(') && k.endsWith(')')

    const formatKey = (key) => {
      return (isValidIdentifier(key) || isSymbolKey(key))
        ? `<span class="console-key">${escapeHtml(key)}</span>`
        : `<span class="console-string">"${escapeHtml(key)}"</span>`
    }

    if (value && value.type === 'map') {
      const short = `Map(${value.size})`
      if (value.size === 0) return `<span>${short} {}</span>`

      let result = `<span>${short} {\n`

      ;(value.entries || []).forEach(([k, v], index) => {
        const keyFormatted = formatKey(k)
        const valueFormatted = formatValue(v, indentLevel + 1)

        result += `${indent}  ${keyFormatted} => ${valueFormatted}`

        if (index < value.entries.length - 1) result += ','
        result += '\n'
      })

      result += `${indent}}</span>`
      return result
    }

    const keys = Object.keys(value)
    if (keys.length === 0) return '{}'

    let result = '{\n'

    keys.forEach((key, index) => {
      const renderedKey = formatKey(key)

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
    consoleLogCount++
    updateConsoleBadge()
  },
  default: (payload, type) => {
    let content
    if (type === 'log:table') {
      content = payload.map(item => formatTable(item)).join(' ')
    } else {
      content = payload.map(item => formatValue(item)).join(' ')
    }
    const listItem = createListItem(content, type)
    $consoleList.appendChild(listItem)
    consoleLogCount++
    updateConsoleBadge()
  },
  loop: (payload) => {
    clearConsole()
    const { message } = payload
    const errorItem = createListItem(`${message}`, 'error')
    errorItem.classList.add('error')
    $consoleList.appendChild(errorItem)
    consoleLogCount++
    updateConsoleBadge()
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
