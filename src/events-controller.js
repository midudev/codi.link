import mitt from 'mitt'
import { capitalize, searchByLine } from './utils/string.js'
import { downloadUserCode } from './download.js'

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
  DOWNLOAD_USER_CODE: 'DOWNLOAD_USER_CODE'
}

eventBus.on(EVENTS.ADD_SKYPACK_PACKAGE, ({ skypackPackage, url }) => {
  const importStatement = `import ${capitalize(skypackPackage)} from '${url}';`
  const existPackage = searchByLine(jsEditor.getValue(), url)
  if (!existPackage) {
    jsEditor.setValue(`${importStatement}\n${jsEditor.getValue()}`)
  }
})

eventBus.on(EVENTS.DOWNLOAD_USER_CODE, () => {
  downloadUserCode({
    htmlContent: htmlEditor.getValue(),
    cssContent: cssEditor.getValue(),
    jsContent: jsEditor.getValue()
  })
})
