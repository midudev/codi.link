
import './loader.styes.css'

class Loader extends window.HTMLElement {
  constructor () {
    super()
    this.classList.add(['loader'])

    this.addAttributesClasses(this.attributes)

    if (this.attributes.hideWhenAppIsLoaded.value === 'true') {
      this.hanldeHideWhenAppIsLoaded()
    }
  }

  addAttributesClasses (attr) {
    for (const key in attr) {
      const cls = attr[key]

      if (cls.value === 'true') {
        this.addClass([cls.nodeName])
      }
    }
  }

  addClass (className) {
    const classes = {
      full: 'loader--full',
      absolute: 'loader--absolute',
      hide: 'loader--hide'
    }

    if (classes[className]) {
      this.classList.add([classes[className]])
    }
  }

  connectedCallback () {
    if (!this.childNodes.length) {
      const defaultValue = { value: '40px' }
      const { width = defaultValue, height = defaultValue } = this.attributes

      this.innerHTML = `
        <div class="spinner" style="--width:${width.value}; --height:${height.value}"></div>
      `
    }
  }

  hanldeHideWhenAppIsLoaded () {
    const listener = () => {
      this.addClass('hide')
      window.onload = null
    }

    window.onload = listener
  }
}

const options = {
  full: null,
  hideWhenAppIsLoaded: false,
  width: '40px',
  height: '40px'
}

window.customElements.define('c-loader', Loader, options)
