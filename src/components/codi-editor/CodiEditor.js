import { LitElement, html } from 'lit'
import * as monaco from 'monaco-editor'
import { emmetHTML } from 'emmet-monaco-es'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import JsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { registerAutoCompleteHTMLTag } from './extensions/autocomplete-html-tag.js'
import { initEditorHotKeys } from './extensions/editor-hotkeys.js'
import { CodiEditorStyles } from './CodiEditor.styles.js'

export class CodiEditor extends LitElement {
  static get styles () {
    return CodiEditorStyles
  }

  static get properties () {
    return {
      language: {
        type: String,
        reflects: true
      },
      value: {
        type: String
      }
    }
  }

  render () {
    return html`<slot></slot>`
  }

  constructor () {
    super()
    this.constructor.initEditor()
  }

  createEditor (options) {
    this.editor = monaco.editor.create(this, {
      value: this.value,
      language: this.language,
      ...options
    })
    initEditorHotKeys(this.editor)
    return this.editor
  }

  static initEditor () {
    if (!this.editorInitialized) {
      window.MonacoEnvironment = {
        getWorker (_, label) {
          switch (label) {
            case 'html': return new HtmlWorker()
            case 'javascript': return new JsWorker()
            case 'css': return new CssWorker()
            default: return new EditorWorker()
          }
        }
      }

      emmetHTML(monaco)
      registerAutoCompleteHTMLTag(monaco)
      this.editorInitialized = true
    }
  }
}
