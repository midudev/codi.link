import { encode, decode } from 'js-base64'
import { $, $$ } from './utils/dom.js'
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

/** @type {HTMLIFrameElement} */
const iframe = $('iframe')

const editorElements = $$('codi-editor')

const EDITORS = createEditors()

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
  updateSearchParams,
  MS_UPDATE_HASH_DEBOUNCED_TIME
)

const { html: htmlEditor, css: cssEditor, javascript: jsEditor } = EDITORS

htmlEditor.focus()
Object.values(EDITORS).forEach((editor) => {
  const needReload = editor !== cssEditor
  editor.onDidChangeModelContent(() => debouncedUpdate({ needReload }))
})
initializeEventsController({ htmlEditor, cssEditor, jsEditor })

configurePrettierHotkeys([htmlEditor, cssEditor, jsEditor])

update()

function update ({ needReload = true } = {}) {
  const values = {
    html: htmlEditor.getValue(),
    css: cssEditor.getValue(),
    js: jsEditor.getValue()
  }

  Preview.updatePreview(values)

  if (needReload) {
    iframe.setAttribute('srcdoc', htmlForPreview)
  }

  updateCss()

  debouncedUpdateHash(values)
  updateButtonAvailabilityIfContent(values)
}

function updateCss () {
  const previewStyle = iframe.contentDocument.querySelector('#preview-style')
  if (previewStyle) {
    previewStyle.textContent = cssEditor.getValue()
  }
}

function updateSearchParams ({ html, css, js }) {
  const encoded = {
    html: encode(html),
    css: encode(css),
    javascript: encode(js)
  }
  const searchParams = new URLSearchParams(encoded)
  window.history.replaceState(null, null, `?${searchParams}`)
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

function createEditors () {
  const initialValues = getValuesFromUrl()

  const editors = {}

  editorElements.forEach((domElement) => {
    const { language } = domElement
    domElement.value = initialValues[language]
    editors[language] = createEditor(domElement)
  })

  return editors
}

function getValuesFromUrl () {
  const searchParams = new URLSearchParams(window.location.search)

  const {
    html: rawHtml,
    css: rawCss,
    javascript: rawJs
  } = Object.fromEntries(searchParams)

  return {
    html: rawHtml ? decode(rawHtml) : '',
    css: rawCss ? decode(rawCss) : '',
    javascript: rawJs ? decode(rawJs) : ''
  }
}
