import { getState } from './state.js'

const {
  fontFamily,
  fontLigatures,
  fontSize,
  lineNumbers,
  minimap,
  tabSize,
  theme,
  wordWrap
} = getState()

const COMMON_EDITOR_OPTIONS = {
  fontFamily,
  fontLigatures,
  fontSize,
  lineNumbers,
  tabSize,
  minimap: {
    enabled: minimap
  },
  theme,
  wordWrap,
  // fixed values
  automaticLayout: true,
  fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  padding: {
    top: 16
  }
}

export const createEditor = (domElement) => {
  return domElement.createEditor({ ...COMMON_EDITOR_OPTIONS })
}
