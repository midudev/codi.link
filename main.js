import './style.css'
import Split from 'split-grid'
import { encode, decode } from 'js-base64'
import * as monaco from 'monaco-editor'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import JsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { $settingsUserForm, updateEditorOptions } from './settings-user'

window.MonacoEnvironment = {
  getWorker (_, label) {
    if (label === 'html') return new HtmlWorker()
    if (label === 'javascript') return new JsWorker()
    if (label === 'css') return new CssWorker()
  }
}

const $ = (selector) => document.querySelector(selector)

const $js = $('#js')
const $css = $('#css')
const $html = $('#html')

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
  minimap: {
    enabled: true
  },
  theme: 'vs-dark',
  lineNumbers: 'on'
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

Split({
  columnGutters: [
    {
      track: 1,
      element: document.querySelector('.vertical-gutter')
    }
  ],
  rowGutters: [
    {
      track: 1,
      element: document.querySelector('.horizontal-gutter')
    }
  ]
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

const updateSettingsOptionsUser = e => {
  e.preventDefault()
  if (e.target.name === 'lineNumbers') {
    COMMON_EDITOR_OPTIONS[e.target.name] = e.target.checked ? 'on' : 'off'
  } else if (e.target.name === 'minimap') {
    console.log(!!e.target.checked)
    COMMON_EDITOR_OPTIONS[e.target.name].enabled = !!e.target.checked
  } else {
    COMMON_EDITOR_OPTIONS[e.target.name] = typeof COMMON_EDITOR_OPTIONS[e.target.name] === 'number' ? parseInt(e.target.value) : e.target.value
  }

  updateEditorOptions({
    htmlEditor,
    cssEditor,
    jsEditor,
    COMMON_EDITOR_OPTIONS
  })
}

$settingsUserForm.addEventListener('change', updateSettingsOptionsUser)
