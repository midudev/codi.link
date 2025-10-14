import { getCleanPath, getEncodedPath } from './utils/url.js'
import debounce from './utils/debounce.js'

const MS_UPDATE_HASH_DEBOUNCED_TIME = 1000

function getCurrentCodeFromEditors (EDITORS) {
  return {
    html: EDITORS.html?.getValue() || '',
    css: EDITORS.css?.getValue() || '',
    js: EDITORS.javascript?.getValue() || ''
  }
}

function updateHashedPath ({ html, css, js }) {
  window.history.replaceState(null, null, getEncodedPath({ html, css, js }))
}

const debouncedUpdateHashedPath = debounce(updateHashedPath, MS_UPDATE_HASH_DEBOUNCED_TIME)

export function handleUrlSyncOnType (codeValues) {
  debouncedUpdateHashedPath(codeValues)
}

export function setUrlSync (isUrlSyncEnabled, EDITORS) {
  const currentPathIsEmpty = window.location.pathname === '/'

  const shouldEncodeUrl = isUrlSyncEnabled && currentPathIsEmpty
  const shouldCleanUrl = !isUrlSyncEnabled && !currentPathIsEmpty

  if (shouldEncodeUrl) {
    const { html, css, js } = getCurrentCodeFromEditors(EDITORS)
    window.history.replaceState(null, null, getEncodedPath({ html, css, js }))
    return
  }

  if (shouldCleanUrl) {
    window.history.replaceState(null, null, getCleanPath())
  }
}
