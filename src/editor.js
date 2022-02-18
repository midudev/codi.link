import { getState } from './state.js'
import { registerAutoCompleteHTMLTag } from './editor-extensions/autocomplete-html-tag.js'
import { registerCSSIntelligence } from './editor-extensions/css-intelligence.js'

const {
  fontSize,
  lineNumbers,
  minimap,
  theme,
  wordWrap,
  fontLigatures,
  fontFamily,
  tabSize
} = getState()

const COMMON_EDITOR_OPTIONS = {
  fontSize,
  lineNumbers,
  tabSize,
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
    return new EditorWorker()
  }
}

registerAutoCompleteHTMLTag(monaco)
registerCSSIntelligence(monaco)

export const createEditor = ({ domElement, language, value }) => {
  return monaco.editor.create(domElement, {
    value,
    language,
    ...COMMON_EDITOR_OPTIONS
  })
}