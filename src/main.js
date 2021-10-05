import './style.css'

import { initEditorHotKeys } from './utils/editor-hotkeys.js'
import { decodeURL, encodeURL } from './utils/url'
import { $ } from './utils/dom.js'
import { createEditor } from './editor.js'
import debounce from './utils/debounce.js'
import { capitalize } from './utils/string'
import { subscribe } from './state'

import './aside.js'
import './skypack.js'
import './settings.js'
import './grid.js'

const $js = $('#js')
const $css = $('#css')
const $html = $('#html')

const urlParams = decodeURL()

const [rawHtml, rawCss, rawJs] = urlParams.split('|')

const html = rawHtml || ''
const css = rawCss || ''
const js = rawJs || ''

const htmlEditor = createEditor({ domElement: $html, language: 'html', value: html })
const cssEditor = createEditor({ domElement: $css, language: 'css', value: css })
const jsEditor = createEditor({ domElement: $js, language: 'javascript', value: js })

window.onmessage = ({ data }) => {
  if (Object.prototype.toString.call(data) === '[object Object]' && Object.keys(data).includes('package')) {
    jsEditor.setValue(`import ${capitalize(data.package)} from '${data.url}';\n${jsEditor.getValue()}`)
  }
}

subscribe(state => {
  const EDITORS = [htmlEditor, cssEditor, jsEditor]
  EDITORS.forEach(editor => {
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
})

const MS_UPDATE_DEBOUNCED_TIME = 200
const debouncedUpdate = debounce(update, MS_UPDATE_DEBOUNCED_TIME)

htmlEditor.focus()
htmlEditor.onDidChangeModelContent(debouncedUpdate)
cssEditor.onDidChangeModelContent(debouncedUpdate)
jsEditor.onDidChangeModelContent(debouncedUpdate)

initEditorHotKeys({ htmlEditor, cssEditor, jsEditor })

const htmlForPreview = createHtml({ html, js, css })
$('iframe').setAttribute('srcdoc', htmlForPreview)

function update () {
  const html = htmlEditor.getValue()
  const css = cssEditor.getValue()
  const js = jsEditor.getValue()

  const encodedURL = encodeURL({ html, js, css })

  window.history.replaceState(null, null, `/${encodedURL}`)

  const htmlForPreview = createHtml({ html, js, css })
  $('iframe').setAttribute('srcdoc', htmlForPreview)
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
