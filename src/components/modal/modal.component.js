import { LitElement, html } from 'lit'
import ModalStyle from './modal.styles.js'

export class Modal extends LitElement {
  static get styles () {
    return ModalStyle
  }

  static get properties () {
    return {
      title: { type: String }
    }
  }

  constructor () {
    super()
    this.title = ''
  }

  closeModal () {
    document.body.removeChild(this)
  }

  render () {
    return html`
      <div class="modal">
        <div class="modal-header">
          <h3>${this.title}</h3>
          <svg xmlns="http://www.w3.org/2000/svg" @click="${this.closeModal}" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.11641 7.99992L2.55835 12.558L3.44223 13.4419L8.00029 8.88381L12.5583 13.4419L13.4422 12.558L8.88417 7.99992L13.4422 3.44187L12.5583 2.55798L8.00029 7.11604L3.44223 2.55798L2.55835 3.44187L7.11641 7.99992Z" fill="#424242"/>
          </svg>
        </div>
        <div class="modal-content">
          <slot></slot>
        </div>
      </di>
    `
  }
}
