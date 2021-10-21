import { encode, decode } from 'js-base64'
import { $, $$ } from './utils/dom.js'
import { createEditor } from './editor.js'
import debounce from './utils/debounce.js'
import { createHtml } from './utils/createHtml'
import { initializeEventsController } from './events-controller.js'
import { getState, subscribe } from './state.js'
import WindowPreviewer from './utils/WindowPreviewer.js'
import setGridLayout from './grid.js'

import './aside.js'
import './skypack.js'
import './settings.js'
import './scroll.js'

import { BUTTON_ACTIONS } from './constants/button-actions.js'

import './components/layout-preview/layout-preview.js'
import './components/codi-editor/codi-editor.js'

const { layout: currentLayout } = getState()

setGridLayout(currentLayout)

const editorElements = $$('codi-editor')

const { pathname } = window.location

const pathnameString = pathname.slice(1)

const [rawHtml, rawCss, rawJs] = pathnameString.split('&')

/* eslint-disable */
const regexBase64 =
  /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}==)?\&(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}==)?\&(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}==)?$/;
/* eslint-enable */

let isValidUrl = true

if (pathnameString !== '') {
  if (regexBase64.test(pathnameString)) {
    isValidUrl = true
  } else {
    window.history.replaceState(null, null, '/')
    isValidUrl = false
  }
} else {
  window.history.replaceState(null, null, '/')
  isValidUrl = false
}

const VALUES = {
  html: isValidUrl ? decode(rawHtml) : '',
  css: isValidUrl ? decode(rawCss) : '',
  javascript: isValidUrl ? decode(rawJs) : ''
}

const EDITORS = Array.from(editorElements).reduce((acc, domElement) => {
  const { language } = domElement
  domElement.value = VALUES[language]
  acc[language] = createEditor(domElement)
  return acc
}, {})

subscribe((state) => {
  Object.values(EDITORS).forEach((editor) => {
    const { minimap, ...restOfOptions } = state

    const newOptions = {
      ...restOfOptions,
      minimap: {
        enabled: minimap
      }
    }

    editor.updateOptions({
      ...editor.getRawOptions(),
      ...newOptions
    })
  })
  setGridLayout(state.layout)
})

const MS_UPDATE_DEBOUNCED_TIME = 200
const MS_UPDATE_HASH_DEBOUNCED_TIME = 1000
const debouncedUpdate = debounce(update, MS_UPDATE_DEBOUNCED_TIME)
const debouncedUpdateHash = debounce(
  updateHashedCode,
  MS_UPDATE_HASH_DEBOUNCED_TIME
)

const { html: htmlEditor, css: cssEditor, javascript: jsEditor } = EDITORS
const { html, css, javascript: js } = VALUES

htmlEditor.focus()
Object.values(EDITORS).forEach((editor) =>
  editor.onDidChangeModelContent(debouncedUpdate)
)
initializeEventsController({ htmlEditor, cssEditor, jsEditor })

const initialHtmlForPreview = createHtml({ html, js, css })
$('iframe').setAttribute('srcdoc', initialHtmlForPreview)

const initButtonAvailabilityIfContent = () =>
  updateButtonAvailabilityIfContent({ html, js, css })
initButtonAvailabilityIfContent()

function update () {
  const values = {
    html: htmlEditor.getValue(),
    css: cssEditor.getValue(),
    js: jsEditor.getValue()
  }

  const htmlForPreview = createHtml(values)
  $('iframe').setAttribute('srcdoc', htmlForPreview)

  WindowPreviewer.updateWindowContent(htmlForPreview)
  debouncedUpdateHash(values)
  updateButtonAvailabilityIfContent(values)
}

function updateHashedCode ({ html, css, js }) {
  const hashedCode = `${encode(html)}&${encode(css)}&${encode(js)}`
  window.history.replaceState(null, null, `/${hashedCode}`)
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
