import escapeHTML from 'escape-html'
import { getState } from './state.js'
import { $$ } from './utils/dom.js'

const LANG_ALIASES = {
  html: 'html',
  htm: 'html',
  css: 'css',
  js: 'javascript',
  javascript: 'javascript',
  json: 'javascript',
  ts: 'javascript',
  typescript: 'javascript'
}

const FENCE_RE = /```(\w+)?\n([\s\S]*?)```/g

const mapLang = (lang = '') => LANG_ALIASES[lang.toLowerCase()] || ''

const formatInline = (text) =>
  escapeHTML(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*(.+?)\*(?=[\s).,]|$)/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')

const formatBlocks = (text) => {
  const lines = text.split('\n')
  const html = []
  let list = []

  const flushList = () => {
    if (!list.length) return
    html.push(`<ul>${list.map(item => `<li>${formatInline(item)}</li>`).join('')}</ul>`)
    list = []
  }

  for (const line of lines) {
    const bullet = line.match(/^[-*]\s+(.+)/)
    if (bullet) {
      list.push(bullet[1])
      continue
    }
    flushList()
    if (/^#{1,3}\s+/.test(line)) {
      const title = line.replace(/^#{1,3}\s+/, '')
      html.push(`<p><strong>${formatInline(title)}</strong></p>`)
      continue
    }
    html.push(line.trim() === '' ? '<br>' : `<p>${formatInline(line)}</p>`)
  }
  flushList()
  return html.join('')
}

export const renderMarkdown = (text) => {
  const parts = []
  let lastIndex = 0

  for (const match of text.matchAll(FENCE_RE)) {
    if (match.index > lastIndex) {
      parts.push(formatBlocks(text.slice(lastIndex, match.index)))
    }

    const lang = mapLang(match[1])
    const code = match[2].replace(/\n$/, '')
    const label = lang || match[1] || 'code'
    const rows = code.split('\n').map((line, index) => {
      const text = line.length ? line : '\u00A0'
      return `<div class="ai-cb-row"><span class="ai-cb-ln">${index + 1}</span><code class="ai-cb-code"${lang ? ` data-lang="${escapeHTML(lang)}"` : ''}>${escapeHTML(text)}</code></div>`
    }).join('')
    const logo = lang
      ? `<span class="ai-cb-logo" aria-hidden="true"></span><span class="ai-cb-lang">${escapeHTML(label)}</span>`
      : `<span class="ai-cb-lang">${escapeHTML(label)}</span>`

    parts.push(
      `<div class="ai-cb"${lang ? ` data-lang="${escapeHTML(lang)}"` : ''} data-code="${encodeURIComponent(code)}">` +
        `<div class="ai-cb-head">` +
          `<span class="ai-cb-file">${logo}</span>` +
          `<button type="button" class="ai-cb-copy" aria-label="Copy">` +
            `<svg class="ai-cb-copy-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" /></svg>` +
            `<span class="ai-cb-copy-label">Copy</span>` +
          `</button>` +
        `</div>` +
        `<div class="ai-cb-body">${rows}</div>` +
      `</div>`
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(formatBlocks(text.slice(lastIndex)))
  }

  return parts.join('') || formatBlocks(text)
}

export async function highlightCodeBlocks ($root) {
  const $blocks = $$('.ai-cb[data-lang]', $root)
  if (!$blocks.length) return

  const { monaco, initMonaco } = await import('./components/codi-editor/monaco.js')
  initMonaco()
  monaco.editor.setTheme(getState().theme)

  await Promise.all($blocks.map(async ($block) => {
    const lang = mapLang($block.dataset.lang)
    if (!lang) return

    const $codes = $$('.ai-cb-code', $block)
    const source = $codes.map(($code) => $code.textContent.replace(/\u00A0/g, '')).join('\n')
    if (!source) return

    try {
      const html = await monaco.editor.colorize(source, lang, {
        tabSize: getState().tabSize
      })
      const lines = html.split(/<br\s*\/?>/i)
      $codes.forEach(($code, index) => {
        if (lines[index]) $code.innerHTML = lines[index]
      })
    } catch {
      // Keep escaped text if the tokenizer is not ready.
    }
  }))
}
