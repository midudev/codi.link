import * as monaco from 'monaco-editor'
import { emmetHTML } from 'emmet-monaco-es'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import JsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { getState } from './state.js'
import { $ } from './utils/dom'

import * as themes from './public/assets/themes'

const {
  fontSize,
  lineNumbers,
  minimap,
  theme,
  wordWrap,
  fontLigatures,
  fontFamily
} = getState()

const COMMON_EDITOR_OPTIONS = {
  fontSize,
  lineNumbers,
  minimap: {
    enabled: minimap
  },
  wordWrap,
  theme,
  fontLigatures,
  fontFamily,

  automaticLayout: true,
  fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  padding: {
    top: 16
  }
}

emmetHTML(monaco)

Object.entries(themes).forEach(([name, config]) => {
  monaco.editor.defineTheme(name, config)
  const themeSelect = $('.select select[data-for="theme"]')
  const option = document.createElement('option')
  option.text = name
  option.value = name
  themeSelect.appendChild(option)
})

window.MonacoEnvironment = {
  getWorker (_, label) {
    if (label === 'html') return new HtmlWorker()
    if (label === 'javascript') return new JsWorker()
    if (label === 'css') return new CssWorker()
  }
}

export const createEditor = ({ domElement, language, value }) => {
  return monaco.editor.create(domElement, {
    value,
    language,
    ...COMMON_EDITOR_OPTIONS
  })
}
