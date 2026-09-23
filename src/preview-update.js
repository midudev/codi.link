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
  let lastPreviewKey = ''
  let wantedPreviewId = 0
  let seenPreviewId = 0
  let ackTimer = 0
  let ackAttempts = 0
  let ackMissed = false
  let wasVisible = false
  let visibleRetries = 0

  function clearWatchdog () {
    window.clearTimeout(watchdogId)
    watchdogId = 0
  }

  function clearAckTimer () {
    window.clearTimeout(ackTimer)
    ackTimer = 0
  }

  function previewIsVisible () {
    const rect = iframe.getBoundingClientRect()
    return rect.width > 2 && rect.height > 2
  }

  function acknowledgePreview (id) {
    if (id !== wantedPreviewId) return
    seenPreviewId = id
    ackMissed = false
    visibleRetries = 0
    clearAckTimer()
  }

  function scheduleAck (previewId) {
    wantedPreviewId = previewId
    ackAttempts = 0
    ackMissed = false
    clearAckTimer()
    if (seenPreviewId === previewId) return

    const check = () => {
      ackTimer = 0
      if (seenPreviewId === wantedPreviewId) return
      ackMissed = true
      if (ackAttempts >= 2) return
      ackAttempts += 1
      Preview.reloadIframe(iframe)
      ackTimer = window.setTimeout(check, 300)
    }

    ackTimer = window.setTimeout(check, 300)
  }

  function renderPreview (values, includeJavascript) {
    const key = JSON.stringify([includeJavascript, values.html, values.css, values.js])
    const previewSettled = wantedPreviewId !== 0 && seenPreviewId === wantedPreviewId
    if (key === lastPreviewKey && previewSettled) return

    lastPreviewKey = key
    previewGeneration++
    clearWatchdog()
    Preview.setIframeContent(iframe, Preview.updatePreview(values, { includeJavascript }))
    scheduleAck(Preview.getLastPreviewId())
  }

  function stopPreviewJs (message = 'Process terminated to avoid infinite loop') {
    notifyLoop(message)
    renderPreview(lastValues, false)
  }

  function armWatchdog (timeout) {
    const generation = previewGeneration
    clearWatchdog()
    watchdogId = window.setTimeout(() => {
      if (generation !== previewGeneration) return
      stopPreviewJs()
    }, timeout)
  }

  iframe.addEventListener('load', () => {
    updateCss()
  })

  const visibilityObserver = new window.ResizeObserver(() => {
    const visible = previewIsVisible()
    const becameVisible = visible && !wasVisible
    wasVisible = visible
    if (!becameVisible || !ackMissed || !wantedPreviewId) return
    if (seenPreviewId === wantedPreviewId || visibleRetries >= 2) return
    visibleRetries += 1
    Preview.reloadIframe(iframe)
  })
  visibilityObserver.observe(iframe)

  window.addEventListener('message', (event) => {
    if (event.source !== iframe.contentWindow) return

    if (event.data?.preview === 'ready') {
      acknowledgePreview(Number(event.data.id))
      return
    }

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
      const shouldRunJs = runJavascriptOnChange && !looksLikeInfiniteLoop(values.js)

      if (runJavascriptOnChange && !shouldRunJs) {
        notifyLoop('Process terminated to avoid infinite loop')
      }

      renderPreview(values, shouldRunJs)
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
