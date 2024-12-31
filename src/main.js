import { encode, decode } from 'js-base64'
import { $, $$ } from './utils/dom.js'
import { createEditor } from './editor.js'
import debounce from './utils/debounce.js'
import runJs from './utils/run-js.js'
import { initializeEventsController } from './events-controller.js'
import { getState, subscribe } from './state.js'
import * as Preview from './utils/WindowPreviewer.js'
import setGridLayout from './grid.js'
import setTheme from './theme.js'
import setLanguage from './language.js'
import { configurePrettierHotkeys } from './monaco-prettier/configurePrettier'
import { getHistoryState, subscribeHistory, setHistory } from './history.js'

import './aside.js'
import './skypack.js'
import './settings.js'
import './scroll.js'
import './drag-file.js'
import './console.js'

import { BUTTON_ACTIONS } from './constants/button-actions.js'

import './components/layout-preview/layout-preview.js'
import './components/codi-editor/codi-editor.js'

const { layout: currentLayout, theme, language, saveLocalstorage } = getState()
const { history, updateHistoryItem } = getHistoryState()

setGridLayout(currentLayout)
setTheme(theme)
setLanguage(language)

const iframe = $('iframe')

const editorElements = $$('codi-editor')

let { pathname } = window.location

if (pathname === '/' && saveLocalstorage === true && history.current) {
  const hashedCode = history.items.find(item => item.id === history.current).value
  window.history.replaceState(null, null, `/${hashedCode}`)
  pathname = window.location.pathname
}

const [rawHtml, rawCss, rawJs] = pathname.slice(1).split(pathname.includes('%7C') ? '%7C' : '|')

const VALUES = {
  html: rawHtml ? decode(rawHtml) : '',
  css: rawCss ? decode(rawCss) : '',
  javascript: rawJs ? decode(rawJs) : ''
}

const EDITORS = Array.from(editorElements).reduce((acc, domElement) => {
  const { language } = domElement
  domElement.value = VALUES[language]
  acc[language] = createEditor(domElement)
  return acc
}, {})

subscribe(state => {
  const newOptions = { ...state, minimap: { enabled: state.minimap } }

  Object.values(EDITORS).forEach(editor => {
    editor.updateOptions({
      ...editor.getRawOptions(),
      ...newOptions
    })
  })
  setGridLayout(state.layout)
  setTheme(state.theme)
  setLanguage(state.language)
})

const MS_UPDATE_DEBOUNCED_TIME = 200
const MS_UPDATE_HASH_DEBOUNCED_TIME = 1000
const debouncedUpdate = debounce(update, MS_UPDATE_DEBOUNCED_TIME)
const debouncedUpdateHash = debounce(
  updateHashedCode,
  MS_UPDATE_HASH_DEBOUNCED_TIME
)

const { html: htmlEditor, css: cssEditor, javascript: jsEditor } = EDITORS

if (saveLocalstorage) {
  setHistory(history)

  subscribeHistory(store => {
    if (!store.history.current) {
      jsEditor.setValue('')
      cssEditor.setValue('')
      htmlEditor.setValue('')
    }
    setHistory(store.history)
  })
}

htmlEditor.focus()
Object.values(EDITORS).forEach(editor => {
  editor.onDidChangeModelContent(() =>
    debouncedUpdate({ notReload: editor === cssEditor })
  )
})
initializeEventsController({ htmlEditor, cssEditor, jsEditor })

configurePrettierHotkeys([htmlEditor, cssEditor, jsEditor])

update()

function update ({ notReload } = {}) {
  const values = {
    html: htmlEditor.getValue(),
    css: cssEditor.getValue(),
    js: jsEditor.getValue()
  }

  Preview.updatePreview(values)

  if (!notReload) {
    const { maxExecutionTime } = getState()
    runJs(values.js, parseInt(maxExecutionTime))
      .then(() => {
        iframe.setAttribute('src', Preview.getPreviewUrl())
      })
      .catch(error => {
        console.error('Execution error:', error)
      })
  }

  updateCss()

  debouncedUpdateHash(values)
  if (saveLocalstorage) {
    updateHistory(values)
  }
  updateButtonAvailabilityIfContent(values)
}

function updateCss () {
  const iframeStyleEl = iframe.contentDocument.querySelector('#preview-style')

  if (iframeStyleEl) {
    iframeStyleEl.textContent = cssEditor.getValue()
  }
}

function updateHashedCode ({ html, css, js }) {
  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`
  window.history.replaceState(null, null, `/${hashedCode}`)
}

function updateHistory ({ html, css, js }) {
  const { history } = getHistoryState()
  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`
  const isEmpty = !html.replace(/\n/g, '').trim() && !css.replace(/\n/g, '').trim() && !js.replace(/\n/g, '').trim()

  if (isEmpty && !history.current) {
    return
  }

  updateHistoryItem({ value: hashedCode })
}

function updateButtonAvailabilityIfContent ({ html, css, js }) {
  const buttonActions = [
    BUTTON_ACTIONS.downloadUserCode,
    BUTTON_ACTIONS.openIframeTab,
    BUTTON_ACTIONS.copyToClipboard
  ]

  const hasContent = html || css || js
  buttonActions.forEach(action => {
    const button = $(`button[data-action='${action}']`)
    button.disabled = !hasContent
  })
}
