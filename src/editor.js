import { getState } from './state.js'
import { monaco, initMonaco } from './components/codi-editor/monaco.js'
import { initEditorHotKeys } from './components/codi-editor/extensions/editor-hotkeys.js'

const STATIC_EDITOR_OPTIONS = {
  automaticLayout: false,
  fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  padding: {
    top: 16
  }
}

export const EDITOR_SETTING_KEYS = [
  'fontSize',
  'lineNumbers',
  'minimap',
  'theme',
  'wordWrap',
  'fontLigatures',
  'fontFamily',
  'tabSize',
  'cursorBlinking',
  'cursorSmoothCaretAnimation'
]

export function getEditorOptions (state = getState()) {
  return {
    fontSize: state.fontSize,
    lineNumbers: state.lineNumbers,
    tabSize: state.tabSize,
    minimap: {
      enabled: state.minimap
    },
    wordWrap: state.wordWrap,
    theme: state.theme,
    fontLigatures: state.fontLigatures,
    fontFamily: state.fontFamily,
    cursorBlinking: state.cursorBlinking,
    cursorSmoothCaretAnimation: state.cursorSmoothCaretAnimation,
    ...STATIC_EDITOR_OPTIONS
  }
}

export function hasEditorSettingsChanged (previousState, nextState) {
  return EDITOR_SETTING_KEYS.some(key => previousState[key] !== nextState[key])
}

let layoutObserver
let layoutFrame = 0
const pendingLayoutTargets = new Set()

function getLayoutObserver () {
  if (!layoutObserver) {
    layoutObserver = new window.ResizeObserver(entries => {
      for (const entry of entries) {
        pendingLayoutTargets.add(entry.target)
      }

      if (layoutFrame) return

      layoutFrame = window.requestAnimationFrame(() => {
        layoutFrame = 0
        pendingLayoutTargets.forEach(element => element.editorHandle?.layout())
        pendingLayoutTargets.clear()
      })
    })
  }

  return layoutObserver
}

export function applyEditorOptions (editors, state) {
  const options = getEditorOptions(state)
  Object.values(editors).forEach(editor => {
    editor.updateOptions?.(options)
  })
}

export function createEditorHandle (domElement, { language, value = '' } = {}) {
  let editor = null
  let pendingValue = value
  const contentListeners = []

  const handle = {
    getValue () {
      return editor ? editor.getValue() : pendingValue
    },
    setValue (nextValue) {
      pendingValue = nextValue
      editor?.setValue(nextValue)
    },
    focus () {
      handle.ensureCreated().focus()
    },
    updateOptions (options) {
      editor?.updateOptions(options)
    },
    trigger (...args) {
      editor?.trigger(...args)
    },
    layout () {
      editor?.layout()
    },
    hasTextFocus () {
      return editor?.hasTextFocus() ?? false
    },
    onDidChangeModelContent (listener) {
      contentListeners.push(listener)
      if (editor) editor.onDidChangeModelContent(listener)
    },
    ensureCreated () {
      if (editor) return editor

      initMonaco()
      editor = monaco.editor.create(domElement, {
        value: pendingValue,
        language,
        ...getEditorOptions()
      })
      initEditorHotKeys(editor)
      getLayoutObserver().observe(domElement)
      editor.layout()
      contentListeners.forEach(listener => {
        editor.onDidChangeModelContent(listener)
      })
      return editor
    }
  }

  domElement.editorHandle = handle
  return handle
}
