import { LitElement, html } from 'lit'
import { LayoutPreviewStyles } from './LayoutPreview.styles.js'

export class LayoutPreview extends LitElement {
  static get styles () {
    return LayoutPreviewStyles
  }

  static get properties () {
    return {
      active: {
        type: Boolean
      },
      layout: {
        type: String
      }
    }
  }

  render () {
    return html`
    <div class="html"></div>
    <div class="css"></div>
    <div class="js"></div>
    <div class="result"></div>
    `
  }
}
