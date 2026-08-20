import { capitalize, copyToClipboard, searchByLine } from './utils/string.js'
import { decodeCodeFromPath, getEncodedPath, getEncodedString } from './utils/url.js'
import { isEmptyCode } from './utils/code.js'
import { downloadUserCode } from './download.js'
import { getState } from './state.js'
import { getHistoryState } from './history-store.js'
import { $ } from './utils/dom.js'
import { getTranslation } from './utils/translator.js'

class EventBus extends window.EventTarget {
  on (type, listener) {
    this.addEventListener(type, listener)
  }

  off (type, listener) {
    this.removeEventListener(type, listener)
  }

  emit (type, detail) {
    const event = new window.CustomEvent(type, { detail, cancelable: true })

    this.dispatchEvent(event)
  }
}

export const eventBus = new EventBus()

let jsEditor
let htmlEditor
let cssEditor

export const getCurrentCode = () => ({
  html: htmlEditor?.getValue() ?? '',
  css: cssEditor?.getValue() ?? '',
  js: jsEditor?.getValue() ?? ''
})

export const getEditorByLanguage = (language) => {
  if (language === 'html') return htmlEditor
  if (language === 'css') return cssEditor
  if (language === 'javascript' || language === 'js') return jsEditor
  return null
}

export const initializeEventsController = ({
  jsEditor: _jsEditor,
  htmlEditor: _htmlEditor,
  cssEditor: _cssEditor
}) => {
  jsEditor = _jsEditor
  htmlEditor = _htmlEditor
  cssEditor = _cssEditor
}

export const EVENTS = {
  ADD_SKYPACK_PACKAGE: 'ADD_SKYPACK_PACKAGE',
  DOWNLOAD_USER_CODE: 'DOWNLOAD_USER_CODE',
  DRAG_FILE: 'DRAG_FILE',
  OPEN_EXISTING_INSTANCE: 'OPEN_EXISTING_INSTANCE',
  OPEN_NEW_INSTANCE: 'OPEN_NEW_INSTANCE',
  COPY_CURRENT_CODE_URL: 'COPY-CURRENT-CODE-URL',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  LOAD_DEMO: 'LOAD_DEMO'
}

eventBus.on(
  EVENTS.ADD_SKYPACK_PACKAGE,
  ({ detail: { skypackPackage, url } }) => {
    const importStatement = `import ${capitalize(skypackPackage).replaceAll('.', '_')} from '${url}';`
    const existPackage = searchByLine(jsEditor.getValue(), url)
    if (!existPackage) {
      jsEditor.setValue(`${importStatement}\n${jsEditor.getValue()}`)
    }
  }
)

eventBus.on(EVENTS.DOWNLOAD_USER_CODE, () => {
  const { zipInSingleFile, zipFileName } = getState()
  const { html, css, js } = getCurrentCode()

  downloadUserCode({
    zipFileName,
    zipInSingleFile,
    htmlContent: html,
    cssContent: css,
    jsContent: js
  })
})

eventBus.on(EVENTS.DRAG_FILE, ({ detail: { content, typeFile } }) => {
  const editorByType = {
    'text/javascript': jsEditor,
    'text/css': cssEditor,
    'text/html': htmlEditor
  }

  editorByType[typeFile]?.setValue(content)
})

eventBus.on(EVENTS.OPEN_NEW_INSTANCE, () => {
  const { html, css, js } = getCurrentCode()
  if (!html && !css && !js) return

  const { updateHistory } = getHistoryState()
  updateHistory({ key: 'current', value: null })
})

eventBus.on(EVENTS.OPEN_EXISTING_INSTANCE, ({ detail: { id, value } }) => {
  const { updateHistory } = getHistoryState()
  window.history.replaceState(null, null, `/${value}`)

  const values = decodeCodeFromPath(window.location.pathname)

  htmlEditor.setValue(values.html)
  cssEditor.setValue(values.css)
  jsEditor.setValue(values.javascript)
  updateHistory({ key: 'current', value: id })
})

eventBus.on(EVENTS.CLEAR_HISTORY, () => {
  const { clearHistory } = getHistoryState()
  clearHistory()
})

eventBus.on(EVENTS.LOAD_DEMO, ({ detail: { html = '', css = '', js = '' } }) => {
  const previous = getCurrentCode()
  const { updateHistory, updateHistoryItem } = getHistoryState()

  if (!isEmptyCode(previous)) {
    updateHistoryItem({ value: getEncodedString(previous) })
    updateHistory({ key: 'current', value: null })
  }

  htmlEditor.setValue(html)
  cssEditor.setValue(css)
  jsEditor.setValue(js)
  htmlEditor.focus()
})

const COPY_FEEDBACK_MS = 2000
let copyFeedbackTimer

const showCopySuccess = () => {
  const button = $('[data-action="copy-to-clipboard"]')
  if (!button) return

  const language = getState().language
  button.classList.add('is-copied')
  button.setAttribute('aria-label', getTranslation('copied', language))

  clearTimeout(copyFeedbackTimer)
  copyFeedbackTimer = setTimeout(() => {
    button.classList.remove('is-copied')
    button.setAttribute('aria-label', getTranslation('copyClipboard', language))
  }, COPY_FEEDBACK_MS)
}

eventBus.on(EVENTS.COPY_CURRENT_CODE_URL, async () => {
  const encodedPath = getEncodedPath(getCurrentCode())
  const urlToCopy = `${window.location.origin}${encodedPath}`

  await copyToClipboard(urlToCopy)
  showCopySuccess()
})
