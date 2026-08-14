import { $ } from './utils/dom.js'
import * as Preview from './utils/WindowPreviewer.js'
import { getHistoryState } from './history-store.js'
import { getEncodedString } from './utils/url.js'
import { handleUrlSyncOnType } from './url-sync.js'
import { getEditorValues, isEmptyCode } from './utils/code.js'
import { BUTTON_ACTIONS } from './constants/button-actions.js'
import debounce from './utils/debounce.js'
import { getState } from './state.js'

const CONTENT_ACTIONS = [
  BUTTON_ACTIONS.downloadUserCode,
  BUTTON_ACTIONS.openIframeTab,
  BUTTON_ACTIONS.copyToClipboard
]

const INFINITE_LOOP_PATTERN = /while\s*\(\s*(?:true|1)\s*\)|for\s*\(\s*;\s*;\s*\)/

function looksLikeInfiniteLoop (js) {
  return INFINITE_LOOP_PATTERN.test(js)
}

function notifyLoop (message) {
  window.postMessage({
    console: {
      type: 'loop',
      payload: { message }
    }
  }, window.location.origin)
}

function postCssUpdate (target, css) {
  target?.postMessage({ type: 'codi:update-css', css }, '*')
}

export function createPreviewUpdater ({ editors, iframe, saveLocalstorage }) {
  const cssEditor = editors.css
  const actionButtons = CONTENT_ACTIONS.map(action =>
    $(`button[data-action='${action}']`)
  )

  let previewGeneration = 0
  let watchdogId = 0
  let lastValues = { html: '', css: '', js: '' }

  function clearWatchdog () {
    window.clearTimeout(watchdogId)
    watchdogId = 0
  }

  function stopPreviewJs (message = 'Process terminated to avoid infinite loop') {
    previewGeneration++
    clearWatchdog()
    notifyLoop(message)
    iframe.srcdoc = Preview.updatePreview(lastValues, { includeJavascript: false })
  }

  function armWatchdog (timeout) {
    const generation = previewGeneration
    clearWatchdog()
    watchdogId = window.setTimeout(() => {
      if (generation !== previewGeneration) return
      stopPreviewJs()
    }, timeout)
  }

  window.addEventListener('message', (event) => {
    if (event.source !== iframe.contentWindow) return

    if (event.data?.preview === 'exec-start') {
      const timeout = parseInt(getState().maxExecutionTime, 10) || 200
      armWatchdog(timeout)
      return
    }

    if (event.data?.preview === 'done') {
      previewGeneration++
      clearWatchdog()
    }
  })

  function updateCss () {
    const css = cssEditor.getValue()
    postCssUpdate(iframe.contentWindow, css)
    postCssUpdate(Preview.getPreviewWindow(), css)
  }

  function persistHistory (values) {
    const { history, updateHistoryItem } = getHistoryState()
    const hashedCode = getEncodedString(values)

    if (isEmptyCode(values) && !history.current) {
      return
    }

    updateHistoryItem({ value: hashedCode })
  }

  const debouncedPersistHistory = debounce(persistHistory, 1000)

  if (saveLocalstorage) {
    window.addEventListener('pagehide', () => {
      persistHistory(getEditorValues(editors))
    })
  }

  function updateButtonAvailability (values) {
    const hasContent = values.html || values.css || values.js
    actionButtons.forEach(button => {
      if (button) button.disabled = !hasContent
    })
  }

  return function update ({ notReload } = {}) {
    const values = getEditorValues(editors)
    const { runJavascriptOnChange, urlSync } = getState()
    lastValues = values

    if (notReload) {
      updateCss()
    } else {
      previewGeneration++
      clearWatchdog()

      const shouldRunJs = runJavascriptOnChange && !looksLikeInfiniteLoop(values.js)

      if (runJavascriptOnChange && !shouldRunJs) {
        notifyLoop('Process terminated to avoid infinite loop')
      }

      iframe.srcdoc = Preview.updatePreview(values, { includeJavascript: shouldRunJs })
    }

    if (saveLocalstorage) {
      debouncedPersistHistory(values)
    }

    if (urlSync) {
      handleUrlSyncOnType(values)
    }

    updateButtonAvailability(values)
  }
}
