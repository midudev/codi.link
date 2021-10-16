import { LitElement, html } from 'lit'
import ShareStyle from './share.styles.js'

export class Share extends LitElement {
  static get styles () {
    return ShareStyle
  }

  constructor () {
    super()
    this.url = window.location.href
    this.embedCode = `<iframe src="${this.url}" name="codilink" scrolling="No" height="500px" width="100%"></iframe>`
    this.shareLinks = {
      facebook: `https://www.facebook.com/sharer.php?u=${encodeURI(this.url)}`,
      twitter: `http://www.twitter.com/intent/tweet?url=${encodeURI(this.url)}&text=Descubre lo que hice en codi.link por @midudev`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURI(this.url)}`
    }
  }

  render () {
    return html`
    <h4>Link del proyecto</h4>
    <codi-text-field value=${this.url} readonly=${true} id="project-url">
      <svg xmlns="http://www.w3.org/2000/svg" slot="right-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M17.5 0H8.5L7 1.5V6H2.5L1 7.5V22.5699L2.5 24H14.5699L16 22.5699V18H20.7L22 16.5699V4.5L17.5 0ZM17.5 2.12L19.88 4.5H17.5V2.12ZM14.5 22.5H2.5V7.5H7V16.5699L8.5 18H14.5V22.5ZM20.5 16.5H8.5V1.5H16V6H20.5V16.5Z"
            fill="#585b5f" />
      </svg>
    </codi-text-field>
    <div class="divider"></div>
    <div class="share-options">
      <div class="embed-container">
        <h4>¡Añádelo en tu web!</h4>
        <codi-text-field readonly=${true} value=${this.embedCode}>
          <svg xmlns="http://www.w3.org/2000/svg" slot="right-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M17.5 0H8.5L7 1.5V6H2.5L1 7.5V22.5699L2.5 24H14.5699L16 22.5699V18H20.7L22 16.5699V4.5L17.5 0ZM17.5 2.12L19.88 4.5H17.5V2.12ZM14.5 22.5H2.5V7.5H7V16.5699L8.5 18H14.5V22.5ZM20.5 16.5H8.5V1.5H16V6H20.5V16.5Z"
                fill="#585b5f" />
          </svg>
        </codi-text-field>
      </div>
      <div class="social-container">
        <h4>Compártelo en tus redes sociales</h4>
        <div class="social-options">
          <a href=${this.shareLinks.facebook} target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" style="height: 2rem;">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  fill="#b4b4b4" />
              </svg>
          </a>
          <a href=${this.shareLinks.twitter} target="_blank">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="height: 2rem;">
                <path
                  d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                  fill="#b4b4b4" />
              </svg>
          </a>
          <a href=${this.shareLinks.linkedin} target="_blank">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="height: 2rem;">
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  fill="#b4b4b4" />
              </svg>
          </a>
        </div>
      </div>
    </div>
    `
  }
}
