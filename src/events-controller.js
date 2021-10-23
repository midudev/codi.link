import mitt from 'mitt'
import { capitalize, searchByLine } from './utils/string.js'
import { downloadUserCode } from './download.js'
import { getState } from './state'

export const eventBus = mitt()

const {
  updateSettings
} = getState()

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
  SET_DEFAULT_NAME: 'SET_DEFAULT_NAME'
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

eventBus.on(EVENTS.SET_DEFAULT_NAME, (name) => {
  updateSettings({
    key: 'userName',
    value: name
  })
})
