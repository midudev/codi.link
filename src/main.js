import { $, $$ } from './utils/dom.js'
import { createEditor } from './editor.js'
import debounce from './utils/debounce.js'
import { createHtml } from './utils/createHtml'
import { initializeEventsController } from './events-controller.js'
import { getState, subscribe } from './state.js'
import WindowPreviewer from './utils/WindowPreviewer.js'
import setGridLayout from './grid.js'
import setSidebar from './sidebar.js'
import { configurePrettierHotkeys } from './monaco-prettier/configurePrettier'
import { getCodesInUrl, buildHashedCode } from './utils/url'

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

const VALUES = getCodesInUrl()

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
  setSidebar(state.sidebar)
})

const MS_UPDATE_DEBOUNCED_TIME = 200
const MS_UPDATE_HASH_DEBOUNCED_TIME = 1000
const debouncedUpdate = debounce(update, MS_UPDATE_DEBOUNCED_TIME)
const debouncedUpdateHash = debounce(updateHashedCode, MS_UPDATE_HASH_DEBOUNCED_TIME)

const { html: htmlEditor, css: cssEditor, javascript: jsEditor } = EDITORS
const { html, css, javascript: js } = VALUES

htmlEditor.focus()
Object.values(EDITORS).forEach(editor => {
  editor.onDidChangeModelContent(() => debouncedUpdate({ notReload: editor === cssEditor }))
})
initializeEventsController({ htmlEditor, cssEditor, jsEditor })

const initialHtmlForPreview = createHtml({ html, js, css })
iframe.setAttribute('srcdoc', initialHtmlForPreview)
configurePrettierHotkeys([htmlEditor, cssEditor, jsEditor])

const initButtonAvailabilityIfContent = () => updateButtonAvailabilityIfContent({ html, js, css })
initButtonAvailabilityIfContent()

function update ({ notReload }) {
  const values = {
    html: htmlEditor.getValue(),
    css: cssEditor.getValue(),
    js: jsEditor.getValue()
  }

  const htmlForPreview = createHtml(values)

  if (!notReload) {
    iframe.setAttribute('srcdoc', htmlForPreview)
  }

  updateCss()

  WindowPreviewer.updateWindowContent(htmlForPreview)
  debouncedUpdateHash(values)
  updateButtonAvailabilityIfContent(values)
}

function updateCss () {
  iframe.contentDocument
    .querySelector('#preview-style').textContent = cssEditor.getValue()
}

function updateHashedCode ({ html, css, js }) {
  const hashedCode = buildHashedCode(html, css, js)
  window.history.replaceState(null, null, `/${hashedCode}`)
}

function updateButtonAvailabilityIfContent ({ html, css, js }) {
  const buttonActions = [BUTTON_ACTIONS.downloadUserCode, BUTTON_ACTIONS.openIframeTab, BUTTON_ACTIONS.copyToClipboard]
  const hasContent = html || css || js
  buttonActions.forEach(action => {
    const button = $(`button[data-action='${action}']`)
    button.disabled = !hasContent
  })
}
