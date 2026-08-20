import { $, $$ } from './utils/dom.js'
import { applyEditorOptions, createEditorHandle, hasEditorSettingsChanged } from './editor.js'
import debounce from './utils/debounce.js'
import { initializeEventsController, eventBus, EVENTS } from './events-controller.js'
import { getState, subscribe } from './state.js'
import setGridLayout from './grid.js'
import setTheme from './theme.js'
import setLanguage from './language.js'
import { getHistoryState, subscribeHistory, setHistory } from './history.js'
import { decodeCodeFromPath } from './utils/url.js'
import { getLayoutType, resolveLayoutType } from './utils/layout.js'
import { setUrlSync } from './url-sync.js'
import { createPreviewUpdater } from './preview-update.js'
import { BUTTON_ACTIONS } from './constants/button-actions.js'

import './aside.js'
import './scroll.js'
import './drag-file.js'
import './console.js'

if (navigator.userAgent.includes('Electron')) {
  document.documentElement.dataset.shell = 'electron'
}

const { layout: currentLayout, theme, language, saveLocalstorage } = getState()
const { history } = getHistoryState()

setGridLayout(currentLayout)
setTheme(theme)
setLanguage(language)

const iframe = $('iframe')
const $runJavascriptOnChangeCheckbox = $("input[name='runJavascriptOnChange']")
const editorElements = $$('#editor .editor')

let { pathname } = window.location

if (pathname === '/' && saveLocalstorage === true && history.current) {
  const hashedCode = history.items.find(item => item.id === history.current).value
  window.history.replaceState(null, null, `/${hashedCode}`)
  pathname = window.location.pathname
}

const VALUES = decodeCodeFromPath(pathname)

const initialLayoutType = resolveLayoutType(currentLayout)
const shouldCreateAllEditors = initialLayoutType !== 'tabs'

const EDITORS = editorElements.reduce((acc, domElement) => {
  const language = domElement.dataset.language
  acc[language] = createEditorHandle(domElement, {
    language,
    value: VALUES[language]
  })
  return acc
}, {})

const editorsToCreate = shouldCreateAllEditors
  ? Object.values(EDITORS)
  : [EDITORS.html]

editorsToCreate.forEach(editor => editor.ensureCreated())

let previousState = getState()

subscribe(state => {
  if (hasEditorSettingsChanged(previousState, state)) {
    applyEditorOptions(EDITORS, state)
  }

  if (getLayoutType(previousState.layout) !== getLayoutType(state.layout)) {
    setGridLayout(state.layout)
  }

  if (state.theme !== previousState.theme) {
    setTheme(state.theme)
  }

  if (state.language !== previousState.language) {
    setLanguage(state.language)
  }

  if (state.urlSync !== previousState.urlSync) {
    setUrlSync(state.urlSync, EDITORS)
  }

  previousState = state
})

setUrlSync(previousState.urlSync, EDITORS)

const MS_UPDATE_DEBOUNCED_TIME = 400
const update = createPreviewUpdater({ editors: EDITORS, iframe, saveLocalstorage })
const debouncedUpdate = debounce(update, MS_UPDATE_DEBOUNCED_TIME)

const { html: htmlEditor, css: cssEditor, javascript: jsEditor } = EDITORS

if (saveLocalstorage) {
  setHistory(history)

  subscribeHistory(store => {
    if (!store.history.current) {
      jsEditor.setValue('')
      cssEditor.setValue('')
      htmlEditor.setValue('')
    }
    setHistory(store.history)
  })
}

htmlEditor.focus()
Object.values(EDITORS).forEach(editor => {
  editor.onDidChangeModelContent(() =>
    debouncedUpdate({ notReload: editor === cssEditor })
  )
})
initializeEventsController({ htmlEditor, cssEditor, jsEditor })

update()

$runJavascriptOnChangeCheckbox?.addEventListener('change', ({ target }) => {
  if (target.checked) {
    update()
  }
})

window.addEventListener('keydown', (event) => {
  const hasModifier = event.metaKey || event.ctrlKey

  if (hasModifier && event.key.toLowerCase() === 'p') {
    event.preventDefault()
    const focusedEditor = Object.values(EDITORS).find(editor => editor.hasTextFocus())
    ;(focusedEditor || htmlEditor).trigger('keyboard', 'editor.action.quickCommand')
    return
  }

  if (!hasModifier || event.key !== 's') return

  event.preventDefault()

  const downloadButton = $(`button[data-action='${BUTTON_ACTIONS.downloadUserCode}']`)

  if (!downloadButton.disabled) {
    eventBus.emit(EVENTS.DOWNLOAD_USER_CODE)
  }
})
