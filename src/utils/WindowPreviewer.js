import { createHtml } from './createHtml'

let previewUrl = null
let iframePreviewUrl = null
let previewWindowRef = null
let lastHtml = ''

export function getPreviewWindow () {
  return previewWindowRef?.deref() ?? null
}

function revokeUrl (url) {
  if (url) URL.revokeObjectURL(url)
}

function revokePreviewUrl () {
  revokeUrl(previewUrl)
  previewUrl = null
}

function revokeIframePreviewUrl () {
  revokeUrl(iframePreviewUrl)
  iframePreviewUrl = null
}

function createPreviewBlobUrl (html) {
  revokePreviewUrl()
  const blob = new window.Blob([html], { type: 'text/html' })
  previewUrl = URL.createObjectURL(blob)
  return previewUrl
}

const usesBlobIframe = typeof navigator !== 'undefined' &&
  navigator.userAgent.includes('Electron')

export function setIframeContent (iframe, html) {
  if (!usesBlobIframe) {
    iframe.removeAttribute('src')
    iframe.srcdoc = html
    return
  }

  revokeIframePreviewUrl()
  const blob = new window.Blob([html], { type: 'text/html' })
  iframePreviewUrl = URL.createObjectURL(blob)
  iframe.removeAttribute('srcdoc')
  iframe.src = iframePreviewUrl
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
  revokeIframePreviewUrl()
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
