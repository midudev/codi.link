import { monaco } from './index.js'
import { emmetHTML } from 'emmet-monaco-es'
import { loadWASM } from 'onigasm'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'

import { getState } from '../state.js'
import configureThemes from './themes'
import { registerAutoCompleteHTMLTag } from '../editor-extensions/autocomplete-html-tag'

import * as syntaxes from '../assets/syntaxes'

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

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

window.MonacoEnvironment = {
  getWorker (_, label) {
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new CssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new HtmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new TsWorker()
    }
    return new EditorWorker()
  }
}

emmetHTML(monaco)

export async function createEditors (configs) {
  try {
    const response = await window.fetch('https://cdn.jsdelivr.net/npm/onigasm@2.2.5/lib/onigasm.wasm')
    const buffer = await response.arrayBuffer()
    await loadWASM(buffer)

    const registry = new Registry({
      getGrammarDefinition: async (scopeName) => {
        try {
          const extension = scopeName.split('.')[1]
          const data = {
            format: 'json',
            content: JSON.stringify(syntaxes[extension])
          }
          return data
        } catch (error) {
          console.log('Failed to load tmLanguages files', error)
        }
      }
    })

    const grammars = new Map()
    grammars.set('css', 'source.css')
    grammars.set('html', 'text.html.basic')
    grammars.set('typescript', 'source.ts')
    grammars.set('javascript', 'source.js')

    await configureThemes()

    registerAutoCompleteHTMLTag(monaco)

    const editors = {}

    const closingPairsConfig = {
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '<', close: '>' },
        { open: "'", close: "'" },
        { open: '"', close: '"' }
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: "'", close: "'", notIn: ['string', 'comment'] },
        { open: '"', close: '"', notIn: ['string', 'comment'] }
      ]
    }

    await Promise.all(configs.map(async ({ language, value, domElement }) => {
      const editor = monaco.editor.create(domElement, {
        value,
        language,
        ...COMMON_EDITOR_OPTIONS
      })
      editors[language] = editor
      monaco.languages.setLanguageConfiguration(language, closingPairsConfig)
      return await wireTmGrammars(monaco, registry, grammars, editor)
    }))

    return editors
  } catch (error) {
    console.log('Error while setting up editors', error)
  }
}
