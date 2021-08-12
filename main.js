import Split from 'split-grid'
import { encode, decode } from 'js-base64'
import * as monaco from 'monaco-editor'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import JsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { handleShowSettingsPanel, registerEditors } from './editor-settings'

window.MonacoEnvironment = {
  getWorker (_, label) {
    if (label === 'html') return new HtmlWorker()
    if (label === 'javascript') return new JsWorker()
    if (label === 'css') return new CssWorker()
  }
}

const $ = selector => document.querySelector(selector)

const $js = $('#js')
const $css = $('#css')
const $html = $('#html')
const $grid = $('.grid')

const { pathname } = window.location

const [rawHtml, rawCss, rawJs] = pathname.slice(1).split('%7C')

const html = rawHtml ? decode(rawHtml) : ''
const css = rawCss ? decode(rawCss) : ''
const js = rawJs ? decode(rawJs) : ''

const COMMON_EDITOR_OPTIONS = {
  automaticLayout: true,
  fontSize: 18,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  padding: {
    top: 16
  },
  lineNumbers: 'off',
  minimap: {
    enabled: false
  },
  theme: 'vs-dark',
  wordWrap: 'on'
}

const htmlEditor = monaco.editor.create($html, {
  value: html,
  language: 'html',
  ...COMMON_EDITOR_OPTIONS
})

const cssEditor = monaco.editor.create($css, {
  value: css,
  language: 'css',
  ...COMMON_EDITOR_OPTIONS
})

const jsEditor = monaco.editor.create($js, {
  value: js,
  language: 'javascript',
  ...COMMON_EDITOR_OPTIONS
})

registerEditors([htmlEditor, cssEditor, jsEditor])
document.addEventListener('keydown', function (event) {
  if (event.ctrlKey && event.key === ',') {
    handleShowSettingsPanel()
  }

  if (event.ctrlKey && event.altKey && event.key === '1') {
    $grid.style.setProperty('grid-template-columns', '1fr 5px 0')
    $grid.style.setProperty('grid-template-rows', '1fr 5px 0')
  }

  if (event.ctrlKey && event.altKey && event.key === '2') {
    $grid.style.setProperty('grid-template-columns', '0 5px 1fr')
    $grid.style.setProperty('grid-template-rows', '1fr 5px 0')
  }

  if (event.ctrlKey && event.altKey && event.key === '3') {
    $grid.style.setProperty('grid-template-columns', '1fr 5px 0')
    $grid.style.setProperty('grid-template-rows', '0 5px 1fr')
  }

  if (event.ctrlKey && event.altKey && event.key === '4') {
    $grid.style.setProperty('grid-template-columns', '0 5px 1fr')
    $grid.style.setProperty('grid-template-rows', '0 5px 1fr')
  }

  if (event.ctrlKey && event.altKey && event.key === '5') {
    $grid.style.setProperty('grid-template-columns', '1fr 5px 1fr')
    $grid.style.setProperty('grid-template-rows', '1fr 5px 1fr')
  }
})

Split({
  columnGutters: [{
    track: 1,
    element: document.querySelector('.vertical-gutter')
  }],
  rowGutters: [{
    track: 1,
    element: document.querySelector('.horizontal-gutter')
  }]
})

htmlEditor.onDidChangeModelContent(update)
cssEditor.onDidChangeModelContent(update)
jsEditor.onDidChangeModelContent(update)

const htmlForPreview = createHtml({ html, js, css })
$('iframe').setAttribute('srcdoc', htmlForPreview)

function update () {
  const html = htmlEditor.getValue()
  const css = cssEditor.getValue()
  const js = jsEditor.getValue()

  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`

  window.history.replaceState(null, null, `/${hashedCode}`)

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
</html>
  `
}
