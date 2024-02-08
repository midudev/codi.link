import { LitElement, html } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { DialogStyles } from './dialog.styles'

export const ICONS = {
  info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12.002 2c5.523 0 10.001 4.478 10.001 10.002 0 5.523-4.478 10.001-10.001 10.001C6.478 22.003 2 17.525 2 12.002 2 6.478 6.478 2 12.002 2Zm0 1.5a8.502 8.502 0 1 0 0 17.003 8.502 8.502 0 0 0 0-17.003Zm-.004 7a.75.75 0 0 1 .744.648l.006.102.004 5.502a.75.75 0 0 1-1.493.102l-.007-.101-.004-5.502a.75.75 0 0 1 .75-.75Zm.004-3.497a.999.999 0 1 1 0 1.997.999.999 0 0 1 0-1.997Z" fill="currentColor"/>
</svg>`,
  error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 2c5.523 0 10 4.478 10 10s-4.477 10-10 10S2 17.522 2 12 6.477 2 12 2Zm0 1.667c-4.595 0-8.333 3.738-8.333 8.333 0 4.595 3.738 8.333 8.333 8.333 4.595 0 8.333-3.738 8.333-8.333 0-4.595-3.738-8.333-8.333-8.333Zm-.001 10.835a.999.999 0 1 1 0 1.998.999.999 0 0 1 0-1.998ZM11.994 7a.75.75 0 0 1 .744.648l.007.101.004 4.502a.75.75 0 0 1-1.493.103l-.007-.102-.004-4.501a.75.75 0 0 1 .75-.751Z" fill="currentColor"/>
</svg>`,
  warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12.997 17.002a.999.999 0 1 0-1.997 0 .999.999 0 0 0 1.997 0Zm-.259-7.853a.75.75 0 0 0-1.493.103l.004 4.501.007.102a.75.75 0 0 0 1.493-.103l-.004-4.502-.007-.101Zm1.23-5.488c-.857-1.548-3.082-1.548-3.938 0L2.284 17.662c-.83 1.5.255 3.34 1.97 3.34h15.49c1.714 0 2.799-1.84 1.97-3.34L13.966 3.661Zm-2.626.726a.75.75 0 0 1 1.313 0L20.4 18.388a.75.75 0 0 1-.657 1.113H4.254a.75.75 0 0 1-.657-1.113l7.745-14.001Z" fill="currentColor"/>
</svg>`,
  success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm-1.25 9.94 4.47-4.47a.75.75 0 0 1 1.133.976l-.073.084-5 5a.75.75 0 0 1-.976.073l-.084-.073-2.5-2.5a.75.75 0 0 1 .976-1.133l.084.073 1.97 1.97 4.47-4.47-4.47 4.47Z" fill="currentColor"/>
</svg>`
}

export class ModalDialog extends LitElement {
  static get styles () {
    return DialogStyles
  }

  static get properties () {
    return {
      icon: { type: String },
      text: { type: String }
    }
  }

  render () {
    const iconSvg = ICONS[this.icon] || ''

    return html`
    <dialog modal-mode="mega" inert>
      <form method="dialog">
        <header>
          ${iconSvg ? unsafeHTML(iconSvg) : ''}
          <p>${this.text}</p>
        </header>
        <footer>
          <button class="cancel-button" @click="${this.cancel}">Cancel</button>
          <button class="accept-button" @click="${this.accept}">Accept</button>
        </footer>
      </form>
    </dialog>
    `
  }

  firstUpdated () {
    this.dialog = this.shadowRoot.querySelector('dialog')
  }

  openModal () {
    if (this.dialog && typeof this.dialog.showModal === 'function') {
      this.dialog.showModal()
      this.dialog.removeAttribute('inert')
    } else {
      console.error('The showModal method is not supported by this browser.')
    }
  }

  close () {
    if (this.dialog) {
      this.dialog.close()
    }
  }

  accept () {
    this.dispatchEvent(new Event('confirm'))
    this.close()
  }

  cancel () {
    console.log('Cancelled')
    this.close()
  }
}

window.customElements.define('modal-dialog', ModalDialog)
