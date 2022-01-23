import { LitElement, html } from 'lit'
import { monaco } from '../../monaco/index.js'

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

  createEditor (options) {
    this.editor = monaco.editor.create(this, {
      value: this.value,
      language: this.language,
      ...options
    })
    initEditorHotKeys(this.editor)
    return this.editor
  }
}
