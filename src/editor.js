import { getState } from './state.js'

const {
  fontSize,
  lineNumbers,
  minimap,
  theme,
  wordWrap,
  fontLigatures,
  fontFamily,
  tabSize,
  cursorBlinking,
  cursorSmoothCaretAnimation
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
  cursorBlinking,
  cursorSmoothCaretAnimation,

  automaticLayout: true,
  fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  padding: {
    top: 16
  }
}

export const createEditor = (domElement) => domElement.createEditor({ ...COMMON_EDITOR_OPTIONS })
