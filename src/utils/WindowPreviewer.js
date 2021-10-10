import { $ } from './dom'

class WindowPreviewer {
  constructor () {
    this.previewerWindow = null
    this.iframeStyles = {
      background: '#fff',
      border: '0',
      height: '100%',
      width: '100%'
    }
  }

  setupWindowIframe () {
    const title = `${document.title} | Preview`
    this.previewerWindow.document.title = title
    this.previewerWindow.document.body.style.margin = 0
    this.iframe = this.previewerWindow.document.createElement('iframe')
    Object.entries(this.iframeStyles).forEach(
      ([attr, val]) => (this.iframe.style[attr] = val)
    )
    this.previewerWindow.document.body.appendChild(this.iframe)
  }

  updateWindowContent (html) {
    if (this.previewerWindow) {
      this.iframe.setAttribute(
        'srcdoc',
        html || $('iframe').getAttribute('srcdoc')
      )
    }
  }

  openWindow () {
    this.previewerWindow = window.open()
    this.previewerWindow.addEventListener('beforeunload', () => (this.previewerWindow = null))
    this.setupWindowIframe()
    this.updateWindowContent()
  }
}

const previewer = new WindowPreviewer()

export default previewer
