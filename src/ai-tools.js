import { getEditorByLanguage } from './events-controller.js'

const LANGUAGES = new Set(['html', 'css', 'javascript'])
const MAX_CONTENT = 100_000
const MAX_READ_CHARS = 16_000

const normalizeLanguage = (language) => {
  if (language === 'js') return 'javascript'
  return LANGUAGES.has(language) ? language : null
}

const numberedLines = (value, startLine = 1, endLine) => {
  const lines = value.split('\n')
  const from = Math.min(Math.max(startLine, 1), Math.max(lines.length, 1))
  const to = Math.min(Math.max(endLine ?? lines.length, from), lines.length)
  const slice = lines.slice(from - 1, to)
  const text = slice.map((line, index) => `${from + index}|${line}`).join('\n')
  return {
    language: null,
    start_line: from,
    end_line: to,
    total_lines: lines.length,
    content: text.length > MAX_READ_CHARS
      ? `${text.slice(0, MAX_READ_CHARS)}\n… [truncated]`
      : text
  }
}

export async function executeEditorTool (name, rawArgs) {
  const args = rawArgs && typeof rawArgs === 'object' ? rawArgs : {}
  const language = normalizeLanguage(args.language)
  if (!language) return { error: 'invalid_language' }

  const editor = getEditorByLanguage(language)
  if (!editor) return { error: 'editor_unavailable' }

  if (name === 'read_editor') {
    const result = numberedLines(
      editor.getValue() ?? '',
      Number(args.start_line) || 1,
      args.end_line == null ? undefined : Number(args.end_line)
    )
    result.language = language
    return result
  }

  if (name === 'write_editor') {
    if (typeof args.content !== 'string') return { error: 'invalid_content' }
    if (args.content.length > MAX_CONTENT) return { error: 'too_large' }
    await editor.ensureCreated()
    editor.setValue(args.content)
    await editor.revealLine(1)
    return { ok: true, language, lines: args.content.split('\n').length }
  }

  if (name === 'replace_lines') {
    if (typeof args.content !== 'string') return { error: 'invalid_content' }
    if (args.content.length > MAX_CONTENT) return { error: 'too_large' }
    const start = Number(args.start_line)
    const end = Number(args.end_line)
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
      return { error: 'invalid_range' }
    }

    await editor.ensureCreated()
    const lines = (editor.getValue() ?? '').split('\n')
    const from = Math.min(start, lines.length + 1)
    const to = Math.min(end, Math.max(lines.length, 1))
    const insert = args.content.split('\n')
    const next = [...lines.slice(0, from - 1), ...insert, ...lines.slice(to)]
    editor.setValue(next.join('\n'))
    await editor.revealLine(from)
    return { ok: true, language, start_line: from, end_line: from + insert.length - 1 }
  }

  return { error: 'unknown_tool' }
}
