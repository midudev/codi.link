import * as monaco from 'monaco-editor-core'
import { emmetHTML } from 'emmet-monaco-es'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import JsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { loadWASM } from 'onigasm'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'

import { getState } from './state.js'
import configureThemes from './utils/configureThemes.js'

monaco.languages.register({ id: 'javascript' })
monaco.languages.register({ id: 'typescript' })
monaco.languages.register({ id: 'css' })
monaco.languages.register({ id: 'html' })

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

window.MonacoEnvironment = {
  getWorker (_, label) {
    if (label === 'html') return new HtmlWorker()
    if (label === 'javascript') return new JsWorker()
    if (label === 'css') return new CssWorker()
  }
}

export async function createEditors (configs) {
  await loadWASM('node_modules/onigasm/lib/onigasm.wasm')

  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      const extension = scopeName.split('.')[1]
      const fileNames = {
        js: 'javascript',
        ts: 'typescript'
      }
      const data = {
        format: 'json',
        content: await (await window.fetch(`src/public/assets/syntaxes/${fileNames[extension] || extension}.tmLanguage.json`)).text()
      }
      return data
    }
  })

  const grammars = new Map()
  grammars.set('css', 'source.css')
  grammars.set('html', 'text.html.basic')
  grammars.set('typescript', 'source.ts')
  grammars.set('javascript', 'source.js')

  configureThemes()

  const editors = {}

  await Promise.all(configs.map(async ({ language, value, domElement }) => {
    const editor = monaco.editor.create(domElement, {
      value,
      language,
      ...COMMON_EDITOR_OPTIONS
    })
    editors[language] = editor
    return await wireTmGrammars(monaco, registry, grammars, editor)
  }))

  return editors
}
