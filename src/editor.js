import { isLineNumbersEnabled } from './constants/initial-settings.js'
import { getState } from './state.js'
import { initEditorHotKeys } from './components/codi-editor/extensions/editor-hotkeys.js'

let monacoModulePromise

function loadMonacoModule () {
  monacoModulePromise ??= import('./components/codi-editor/monaco.js')
  return monacoModulePromise
}

const STATIC_EDITOR_OPTIONS = {
  automaticLayout: false,
  fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 16,
  lineNumbersMinChars: 3,
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
    lineNumbers: isLineNumbersEnabled(state.lineNumbers) ? 'on' : 'off',
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
  let creating = null
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
      return handle.ensureCreated().then(ed => ed.focus())
    },
    revealLine (lineNumber, column = 1) {
      return handle.ensureCreated().then(ed => {
        const model = ed.getModel()
        const maxLine = model?.getLineCount() ?? lineNumber
        const line = Math.min(Math.max(lineNumber, 1), maxLine)
        const maxColumn = model?.getLineMaxColumn(line) ?? column
        const col = Math.min(Math.max(column, 1), maxColumn)
        ed.revealLineInCenter(line)
        ed.setPosition({ lineNumber: line, column: col })
        ed.focus()
      })
    },
    updateOptions (options) {
      editor?.updateOptions(options)
    },
    trigger (...args) {
      return handle.ensureCreated().then(ed => ed.trigger(...args))
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
      if (editor) return Promise.resolve(editor)
      if (creating) return creating

      creating = loadMonacoModule().then(({ monaco, initMonaco, ensureEmmet }) => {
        initMonaco()
        if (language === 'html') ensureEmmet()
        editor = monaco.editor.create(domElement, {
          value: pendingValue,
          language,
          ...getEditorOptions()
        })
        initEditorHotKeys(monaco, editor)
        getLayoutObserver().observe(domElement)
        editor.layout()
        contentListeners.forEach(listener => {
          editor.onDidChangeModelContent(listener)
        })
        return editor
      })

      return creating
    }
  }

  domElement.editorHandle = handle
  return handle
}
