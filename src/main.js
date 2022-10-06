import { $, $$ } from './utils/dom.js'
import { BrotliDecompressor, BrotliCompressor } from './utils/Brotli.js'
import { createEditor } from './editor.js'
import debounce from './utils/debounce.js'
import { initializeEventsController } from './events-controller.js'
import { getState, subscribe } from './state.js'
import * as Preview from './utils/WindowPreviewer.js'
import setGridLayout from './grid.js'
import setSidebar from './sidebar.js'
import { configurePrettierHotkeys } from './monaco-prettier/configurePrettier'

import './aside.js'
import './skypack.js'
import './settings.js'
import './scroll.js'
import './drag-file.js'

import { BUTTON_ACTIONS } from './constants/button-actions.js'

import './components/layout-preview/layout-preview.js'
import './components/codi-editor/codi-editor.js'

const { layout: currentLayout, sidebar } = getState()

setGridLayout(currentLayout)
setSidebar(sidebar)

const iframe = $('iframe')

const editorElements = $$('codi-editor')

const { pathname } = window.location

const [rawHtml, rawCss, rawJs] = pathname.slice(1).split('%7C')

const VALUES = {
  html: rawHtml ? await BrotliDecompressor(rawHtml) : '',
  css: rawCss ? await BrotliDecompressor(rawCss) : '',
  javascript: rawJs ? await BrotliDecompressor(rawJs) : ''
}

const EDITORS = Array.from(editorElements).reduce((acc, domElement) => {
  const { language } = domElement
  domElement.value = VALUES[language]
  acc[language] = createEditor(domElement)
  return acc
}, {})

subscribe((state) => {
  const newOptions = { ...state, minimap: { enabled: state.minimap } }

  Object.values(EDITORS).forEach((editor) => {
    editor.updateOptions({
      ...editor.getRawOptions(),
      ...newOptions
    })
  })
  setGridLayout(state.layout)
  setSidebar(state.sidebar)
})

const MS_UPDATE_DEBOUNCED_TIME = 200
const MS_UPDATE_HASH_DEBOUNCED_TIME = 1000
const debouncedUpdate = debounce(update, MS_UPDATE_DEBOUNCED_TIME)
const debouncedUpdateHash = debounce(
  updateHashedCode,
  MS_UPDATE_HASH_DEBOUNCED_TIME
)

const { html: htmlEditor, css: cssEditor, javascript: jsEditor } = EDITORS

htmlEditor.focus()
Object.values(EDITORS).forEach((editor) => {
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
    iframe.setAttribute('src', Preview.getPreviewUrl())
  }

  updateCss()

  debouncedUpdateHash(values)
  updateButtonAvailabilityIfContent(values)
}

function updateCss () {
  const iframeStyleEl = iframe.contentDocument.querySelector('#preview-style')

  if (iframeStyleEl) {
    iframeStyleEl.textContent = cssEditor.getValue()
  }
}

async function updateHashedCode ({ html, css, js }) {
  try {
    const hashedCode = `${await BrotliCompressor(html)}|${await BrotliCompressor(css)}|${await BrotliCompressor(js)}`
    window.history.replaceState(null, null, `/${hashedCode}`)
  } catch (err) {
    console.log(err)
  }
}

function updateButtonAvailabilityIfContent ({ html, css, js }) {
  const buttonActions = [
    BUTTON_ACTIONS.downloadUserCode,
    BUTTON_ACTIONS.openIframeTab,
    BUTTON_ACTIONS.copyToClipboard
  ]
  const hasContent = html || css || js
  buttonActions.forEach((action) => {
    const button = $(`button[data-action='${action}']`)
    button.disabled = !hasContent
  })
}
