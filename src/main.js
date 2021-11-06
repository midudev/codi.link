import './style.css'

import { encode, decode } from 'js-base64'
import { $, $$ } from './utils/dom.js'
import { createEditors } from './monaco/editor.js'
import debounce from './utils/debounce.js'
import { createHtml } from './utils/createHtml'
import { initializeEventsController } from './events-controller.js'
import { getState, subscribe } from './state.js'
import WindowPreviewer from './utils/WindowPreviewer.js'
import setGridLayout from './grid.js'
import { configurePrettierHotkeys } from './monaco-prettier/configurePrettier'

import './aside.js'
import './skypack.js'
import './settings.js'
import './scroll.js'
import './drag-file.js'

import { BUTTON_ACTIONS } from './constants/button-actions.js'

import './components/layout-preview/layout-preview.js'
import './components/codi-editor/codi-editor.js'

const { layout: currentLayout } = getState()

setGridLayout(currentLayout)

const editorElements = $$('codi-editor')

const { pathname } = window.location

const [rawHtml, rawCss, rawJs] = pathname.slice(1).split('%7C')

const VALUES = {
  html: rawHtml ? decode(rawHtml) : '',
  css: rawCss ? decode(rawCss) : '',
  javascript: rawJs ? decode(rawJs) : ''
};

(async () => {
  const editorConfigs = Array.from(editorElements).map(domElement => {
    const { language } = domElement
    domElement.value = VALUES[language]
    return {
      language,
      domElement,
      value: VALUES[language]
    }
  })

  const { javascript: jsEditor, html: htmlEditor, css: cssEditor } = await createEditors(editorConfigs)
  const editors = [htmlEditor, cssEditor, jsEditor]

  subscribe(state => {
    editors.forEach(editor => {
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
  const debouncedUpdateHash = debounce(updateHashedCode, MS_UPDATE_HASH_DEBOUNCED_TIME)
  const { html, css, javascript: js } = VALUES

  htmlEditor.focus()
  editors.forEach(editor => editor.onDidChangeModelContent(debouncedUpdate))
  initializeEventsController({ htmlEditor, cssEditor, jsEditor })

  const initialHtmlForPreview = createHtml({ html, js, css })
  $('iframe').setAttribute('srcdoc', initialHtmlForPreview)
  configurePrettierHotkeys([htmlEditor, cssEditor, jsEditor])

  const initButtonAvailabilityIfContent = () => updateButtonAvailabilityIfContent({ html, js, css })
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
    const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`
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
})()
