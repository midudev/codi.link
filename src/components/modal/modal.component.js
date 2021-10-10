import { LitElement, html } from 'lit'
import ModalStyle from './modal.styles.js'

export class Modal extends LitElement {
  static get styles () {
    return ModalStyle
  }

  static get properties () {
    return {
      title: { type: String },
      'modal-content': { }
    }
  }

  constructor () {
    super()
    this.title = ''
  }

  render () {
    return html`
      <div class="modal">
        <div class="modal-header">
          <h3>${this.title}</h3>
        </div>
        <div class="modal-content">
          <slot></slot>
        </div>
      </di>
    `
  }
}
