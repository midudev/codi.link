import { decode } from 'js-base64'
import { capitalize, searchByLine } from './utils/string.js'
import { downloadUserCode } from './download.js'
import { getState } from './state.js'
import { getHistoryState } from './history.js'

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
  CLEAR_HISTORY: 'CLEAR_HISTORY'
}

eventBus.on(EVENTS.ADD_SKYPACK_PACKAGE, ({ detail: { skypackPackage, url } }) => {
  const importStatement = `import ${capitalize(skypackPackage).replaceAll('.', '_')} from '${url}';`
  const existPackage = searchByLine(jsEditor.getValue(), url)
  if (!existPackage) {
    jsEditor.setValue(`${importStatement}\n${jsEditor.getValue()}`)
  }
})

eventBus.on(EVENTS.DOWNLOAD_USER_CODE, () => {
  const {
    zipInSingleFile,
    zipFileName
  } = getState()

  downloadUserCode({
    zipFileName,
    zipInSingleFile,
    htmlContent: htmlEditor.getValue(),
    cssContent: cssEditor.getValue(),
    jsContent: jsEditor.getValue()
  })
})

eventBus.on(EVENTS.DRAG_FILE, ({ detail: { content, typeFile } }) => {
  const file = typeFile

  switch (file) {
    case 'text/javascript': jsEditor.setValue(content); break
    case 'text/css': cssEditor.setValue(content); break
    case 'text/html': htmlEditor.setValue(content); break
    default: break
  }
})

eventBus.on(EVENTS.OPEN_NEW_INSTANCE, () => {
  const htmlContent = htmlEditor.getValue()
  const cssContent = cssEditor.getValue()
  const jsContent = jsEditor.getValue()

  const isEmpty = !htmlContent && !cssContent && !jsContent
  if (isEmpty) return

  const { updateHistory } = getHistoryState()
  updateHistory({ key: 'current', value: null })
})

eventBus.on(EVENTS.OPEN_EXISTING_INSTANCE, ({ detail: { id, value } }) => {
  const { updateHistory } = getHistoryState()
  let { pathname } = window.location
  window.history.replaceState(null, null, `/${value}`)
  pathname = window.location.pathname

  const [rawHtml, rawCss, rawJs] = pathname.slice(1).split('%7C')

  const VALUES = {
    html: rawHtml ? decode(rawHtml) : '',
    css: rawCss ? decode(rawCss) : '',
    javascript: rawJs ? decode(rawJs) : ''
  }

  htmlEditor.setValue(VALUES.html)
  cssEditor.setValue(VALUES.css)
  jsEditor.setValue(VALUES.javascript)
  updateHistory({ key: 'current', value: id })
})

eventBus.on(EVENTS.CLEAR_HISTORY, () => {
  const { clearHistory } = getHistoryState()
  clearHistory()
})
