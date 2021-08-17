import * as monaco from 'monaco-editor'

const COMMON_EDITOR_OPTIONS = {
  automaticLayout: true,
  fontSize: 18,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  padding: {
    top: 16
  },
  lineNumbers: false,
  minimap: {
    enabled: false
  },
  theme: 'vs-dark'
}

export const createEditor = ({ domElement, language, value }) => {
  monaco.editor.create(domElement, {
    value,
    language,
    ...COMMON_EDITOR_OPTIONS
  })
}
