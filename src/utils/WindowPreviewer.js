import { createHtml } from './createHtml'

let previewUrl = null
let iframePreviewUrl = null
let previewWindowRef = null
let lastHtml = ''
let lastPreviewId = 0
let appliedIframeHtml = ''

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

let guardedIframe = null

function hasNavigatedToApp (iframe) {
  const src = iframe.src
  if (!src || src.startsWith('blob:') || src.startsWith('about:')) return false

  try {
    return new URL(src).origin === window.location.origin
  } catch {
    return false
  }
}

function attachNavigationGuard (iframe) {
  if (guardedIframe === iframe) return
  guardedIframe = iframe

  iframe.addEventListener('load', () => {
    if (!lastHtml || !hasNavigatedToApp(iframe)) return
    setIframeContent(iframe, lastHtml)
  })
}

export function setIframeContent (iframe, html) {
  attachNavigationGuard(iframe)
  appliedIframeHtml = html

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

export function reloadIframe (iframe) {
  const html = appliedIframeHtml
  if (!html) return

  if (usesBlobIframe) {
    appliedIframeHtml = ''
    setIframeContent(iframe, html)
    return
  }

  const parent = iframe.parentNode
  const next = iframe.nextSibling
  if (parent) parent.removeChild(iframe)
  iframe.removeAttribute('src')
  iframe.removeAttribute('srcdoc')
  if (parent) parent.insertBefore(iframe, next)
  iframe.srcdoc = html
}

function syncPreviewWindow (html) {
  const previewWindow = getPreviewWindow()
  if (!previewWindow) return

  previewWindow.location = createPreviewBlobUrl(html)
}

export function getLastPreviewId () {
  return lastPreviewId
}

export function updatePreview ({ html, css, js }, { includeJavascript = true } = {}) {
  lastPreviewId += 1
  lastHtml = createHtml({
    html,
    css,
    js: includeJavascript ? js : '',
    previewId: lastPreviewId
  }, true)
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
