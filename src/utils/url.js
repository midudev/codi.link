const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function encode (value) {
  const bytes = textEncoder.encode(value)
  let binary = ''

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  }

  return btoa(binary)
}

function decode (value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = (4 - (normalized.length % 4)) % 4
  const binary = atob(`${normalized}${'='.repeat(padding)}`)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))

  return textDecoder.decode(bytes)
}

export function getCleanPath () {
  return '/'
}

export function getEncodedPath ({ html = '', css = '', js = '' }) {
  return `/${encode(html)}%7C${encode(css)}%7C${encode(js)}`
}

export function getEncodedString ({ html = '', css = '', js = '' }) {
  return `${encode(html)}|${encode(css)}|${encode(js)}`
}

export function decodeCodeFromPath (pathname = window.location.pathname) {
  const encoded = pathname.startsWith('/') ? pathname.slice(1) : pathname

  if (!encoded) {
    return { html: '', css: '', javascript: '' }
  }

  const separator = encoded.includes('%7C') ? '%7C' : '|'
  const [rawHtml = '', rawCss = '', rawJs = ''] = encoded.split(separator)

  return {
    html: rawHtml ? decode(rawHtml) : '',
    css: rawCss ? decode(rawCss) : '',
    javascript: rawJs ? decode(rawJs) : ''
  }
}
