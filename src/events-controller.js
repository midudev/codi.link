import mitt from 'mitt'
import { capitalize, searchByLine } from './utils/string.js'
import { downloadUserCode } from './download.js'
import { getState } from './state'

export const eventBus = mitt()

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
  DRAG_FILE: 'DRAG_FILE'
}

eventBus.on(EVENTS.ADD_SKYPACK_PACKAGE, ({ skypackPackage, url }) => {
  const importStatement = `import ${capitalize(skypackPackage)} from '${url}';`
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

eventBus.on(EVENTS.DRAG_FILE, ({ content, typeFile }) => {
  const file = typeFile

  switch (file) {
    case 'text/javascript': jsEditor.setValue(content); break
    case 'text/css': cssEditor.setValue(content); break
    case 'text/html': htmlEditor.setValue(content); break
    default: break
  }
})
