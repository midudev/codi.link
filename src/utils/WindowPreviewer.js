import { createHtml } from './createHtml'

let previewUrl = null
let previewWindowRef = null

export function getPreviewUrl () {
  return previewUrl
}

export function updatePreview ({ html, css, js }) {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl)
  }

  const htmlForPreview = createHtml({ html, css, js }, true)

  const blob = new window.Blob([htmlForPreview], { type: 'text/html' })

  previewUrl = URL.createObjectURL(blob)

  if (previewWindowRef?.deref()) {
    previewWindowRef.deref().location = previewUrl
  }
}

export function clearPreview () {
  URL.revokeObjectURL(previewUrl)
  previewUrl = null
}

export function showPreviewerWindow () {
  const previewWindow = window.open(previewUrl, '_blank')

  // Use a WeafRef so when the user closes the window it could be garbage collected.
  // We need to hold a reference so we can update the location of the window when
  // the pewview changes.
  previewWindowRef = new window.WeakRef(previewWindow)
  const title = `${document.title} | Preview`
  previewWindow.document.title = title
}
