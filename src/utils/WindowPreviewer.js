import { createHtml } from './createHtml'

let previewUrl = null
let previewWindowRef = null
let lastHtml = ''

export function getPreviewWindow () {
  return previewWindowRef?.deref() ?? null
}

function revokePreviewUrl () {
  if (!previewUrl) return
  URL.revokeObjectURL(previewUrl)
  previewUrl = null
}

function createPreviewBlobUrl (html) {
  revokePreviewUrl()
  const blob = new window.Blob([html], { type: 'text/html' })
  previewUrl = URL.createObjectURL(blob)
  return previewUrl
}

function syncPreviewWindow (html) {
  const previewWindow = getPreviewWindow()
  if (!previewWindow) return

  previewWindow.location = createPreviewBlobUrl(html)
}

export function updatePreview ({ html, css, js }, { includeJavascript = true } = {}) {
  lastHtml = createHtml({ html, css, js: includeJavascript ? js : '' }, true)
  syncPreviewWindow(lastHtml)
  return lastHtml
}

export function clearPreview () {
  revokePreviewUrl()
  lastHtml = ''
}

export function showPreviewerWindow () {
  const previewWindow = window.open(createPreviewBlobUrl(lastHtml), '_blank')

  // Use a WeakRef so when the user closes the window it could be garbage collected.
  // We need to hold a reference so we can update the location of the window when
  // the preview changes.
  previewWindowRef = new window.WeakRef(previewWindow)
  const title = `${document.title} | Preview`
  previewWindow.document.title = title
}
