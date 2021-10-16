import { LitElement, html } from 'lit'
import TextFieldStyle from './text-field.styles.js'

export class TextField extends LitElement {
  static get styles () {
    return TextFieldStyle
  }

  static get properties () {
    return {
      value: {
        type: String
      },
      placeholder: {
        type: String
      },
      autocomplete: {
        type: String
      },
      readonly: {
        type: String
      }
    }
  }

  constructor () {
    super()
    this.value = ''
    this.placeholder = ''
  }

  handleInput (event) {
    this.value = event.target.value
  }

  render () {
    return html`
        <slot name="left-icon"></slot>
            <input @input=${this.handleInput} .placeholder=${this.placeholder} .value=${this.value} .autocomplete=${this.autocomplete} ?readonly=${this.readonly}>
        <slot name="right-icon"></slot>
    `
  }
}
