import './style.css'

import { initEditorHotKeys } from './utils/editor-hotkeys.js'
import { encode, decode } from 'js-base64'
import { $ } from './utils/dom.js'
import { createEditor } from './editor.js'
import debounce from './utils/debounce.js'
import { subscribe, getState } from './state'
import { initializeEventsController } from './events-controller.js'
import WindowPreviewer from './utils/WindowPreviewer.js'

import './aside.js'
import './skypack.js'
import './settings.js'
import './grid.js'
import './session/main'
import './scroll'

const {
  setEditors
} = getState().editors

const $js = $('#js')
const $css = $('#css')
const $html = $('#html')

const { pathname } = window.location

const [rawHtml, rawCss, rawJs] = pathname.slice(1).split('%7C')

const html = rawHtml ? decode(rawHtml) : ''
const css = rawCss ? decode(rawCss) : ''
const js = rawJs ? decode(rawJs) : ''

const htmlEditor = createEditor({ domElement: $html, language: 'html', value: html })
const cssEditor = createEditor({ domElement: $css, language: 'css', value: css })
const jsEditor = createEditor({ domElement: $js, language: 'javascript', value: js })

subscribe(state => {
  const EDITORS = [htmlEditor, cssEditor, jsEditor]
  EDITORS.forEach(editor => {
    const { minimap, ...restOfOptions } = state.settings

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
})

const MS_UPDATE_DEBOUNCED_TIME = 200
const MS_UPDATE_HASH_DEBOUNCED_TIME = 1000
const debouncedUpdate = debounce(update, MS_UPDATE_DEBOUNCED_TIME)
const debouncedUpdateHash = debounce(updateHashedCode, MS_UPDATE_HASH_DEBOUNCED_TIME)

htmlEditor.focus()
htmlEditor.onDidChangeModelContent(debouncedUpdate)
cssEditor.onDidChangeModelContent(debouncedUpdate)
jsEditor.onDidChangeModelContent(debouncedUpdate)

initEditorHotKeys({ htmlEditor, cssEditor, jsEditor })
setEditors({ html: htmlEditor, css: cssEditor, js: jsEditor })
initializeEventsController({ htmlEditor, cssEditor, jsEditor })

const initialHtmlForPreview = createHtml({ html, js, css })
$('iframe').setAttribute('srcdoc', initialHtmlForPreview)

function update () {
  const html = htmlEditor.getValue()
  const css = cssEditor.getValue()
  const js = jsEditor.getValue()

  const htmlForPreview = createHtml({ html, js, css })
  $('iframe').setAttribute('srcdoc', htmlForPreview)

  WindowPreviewer.updateWindowContent(htmlForPreview)
  debouncedUpdateHash({ html, css, js })
}

function updateHashedCode ({ html, css, js }) {
  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`
  window.history.replaceState(null, null, `/${hashedCode}`)
}

function createHtml ({ html, js, css }) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      ${css}
    </style>
  </head>
  <body>
    ${html}
    <script type="module">
    ${js}
    </script>
  </body>
</html>`
}
