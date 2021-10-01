import { $ } from './dom'

class WindowPreviewer {
  constructor () {
    this.previewerWindow = null
  }

  executeWindowJS () {
    this.previewerWindow.document.body
      .querySelectorAll('script')
      .forEach((oldScript) => {
        const newScript = Array.from(oldScript.attributes).reduce(
          (script, attribute) => {
            script.setAttribute(attribute.name, attribute.value)
            return script
          },
          document.createElement('script')
        )
        newScript.appendChild(document.createTextNode(oldScript.innerHTML))
        oldScript.parentNode.replaceChild(newScript, oldScript)
      })
  }

  updateWindowContent (html) {
    if (this.previewerWindow) {
      this.previewerWindow.document.body.innerHTML = ''

      this.previewerWindow.document.write(
        html || $('iframe').getAttribute('srcdoc')
      )

      this.executeWindowJS()
    }
  }

  openWindow () {
    this.previewerWindow = window.open()
    this.updateWindowContent()
  }
}

const previewer = new WindowPreviewer()

export default previewer
