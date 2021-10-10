import { decode } from 'js-base64'
import './aside.js'
import './nav.js'
import { createEditor } from './editor.js'
import { initializeEventsController } from './events-controller.js'
import './grid.js'
import { getCodeState } from './services/code/code.service.js'
import initDatabase from './services/database'
import './settings.js'
import './skypack.js'
import { subscribe } from './state'
import './style.css'
import { updateIframePreview, updatePreview } from './utils/code.js'
import debounce from './utils/debounce.js'
import { $ } from './utils/dom.js'
import { initEditorHotKeys } from './utils/editor-hotkeys.js'

let htmlEditor, cssEditor, jsEditor

initDatabase()
  .then(() => getCodeState({ id: window.location.pathname.slice(1) }))
  .then(({ code = '' }) => {
    const [rawHtml, rawCss, rawJs] = code.split('|')
    const html = rawHtml ? decode(rawHtml) : ''
    const css = rawCss ? decode(rawCss) : ''
    const js = rawJs ? decode(rawJs) : ''

    htmlEditor = createEditor({ domElement: $('#html'), language: 'html', value: html })
    cssEditor = createEditor({ domElement: $('#css'), language: 'css', value: css })
    jsEditor = createEditor({ domElement: $('#js'), language: 'javascript', value: js })

    updateIframePreview({ html, css, js })

    const MS_UPDATE_DEBOUNCED_TIME = 200
    const debouncedUpdate = debounce(() =>
      updatePreview({
        html: htmlEditor.getValue(),
        css: cssEditor.getValue(),
        js: jsEditor.getValue()
      }), MS_UPDATE_DEBOUNCED_TIME)

    htmlEditor.focus()
    htmlEditor.onDidChangeModelContent(debouncedUpdate)
    cssEditor.onDidChangeModelContent(debouncedUpdate)

    jsEditor.onDidChangeModelContent(debouncedUpdate)
    initEditorHotKeys({ htmlEditor, cssEditor, jsEditor })
    initializeEventsController({ htmlEditor, cssEditor, jsEditor })
  })

subscribe(state => {
  const EDITORS = [htmlEditor, cssEditor, jsEditor]
  EDITORS.forEach(editor => {
    const { minimap, ...restOfOptions } = state

    const newOptions = {
      ...restOfOptions,
      minimap: {
        enabled: minimap
      }
    }

    editor.updateOptions({
      ...editor.getRawOptions(),
      ...newOptions
    })
  })
})
