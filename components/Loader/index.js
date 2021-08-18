
/**
 * TAG: <c-loader></c-loader>
 * ATTRIBUTES:
 * - full => Expanded to parent size
 * - absolute => The element change to position absolute
 * - hide => Hide element
 * - width => Change spinner with
 * - height => Change spinner height
 * - hidewhenappisloaded => hide element when windows is loaded
 * HOW USE:
 * <c-loader></c-loader> spinner
 * <c-loader> Hi </c-loader> Custom loader and without spinner
 * CLASSES TO USE
 * - full =>'loader--full'
 * - absolute => 'loader--absolute'
 * - hide => 'loader--hide'
 * - width => 'loader__spinner-width'
 * - height => 'loader__spinner-height'
 */

import './loader.css'
import './spinner.css'

class Loader extends window.HTMLElement {
  constructor () {
    super()
    this.classList.add(['loader'])

    this.prepareAttributes(this.attributes)
  }

  addClass (className) {
    const classes = {
      full: 'loader--full',
      absolute: 'loader--absolute',
      hide: 'loader--hide',
      width: 'loader__spinner-width',
      height: 'loader__spinner-height'
    }

    if (classes[className]) {
      this.classList.add([classes[className]])
    }
  }

  changeHeightElement (height = '40px') {
    this.style.setProperty('--height', height)
    this.addClass('height')
  }

  changeWidthElement (width = '40px') {
    this.style.setProperty('--width', width)
    this.addClass('width')
  }

  connectedCallback () {
    if (!this.childNodes.length) {
      this.innerHTML = `
        <div class="spinner"></div>
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

  prepareAttributes (attributes) {
    const isTrue = (attr, callback) => attr.value === 'true' && callback()
    const addClass = (attr) => isTrue(attr, () => this.addClass(attr.nodeName))
    const hanldeHideWhenAppIsLoaded = attr => isTrue(attr, () => this.hanldeHideWhenAppIsLoaded())
    const changeWidthElement = (attr) => this.changeWidthElement(attr.value)
    const changeHeightElement = (attr) => this.changeHeightElement(attr.value)

    const actions = {
      hidewhenappisloaded: hanldeHideWhenAppIsLoaded,
      full: addClass,
      absolute: addClass,
      hide: addClass,
      width: changeWidthElement,
      height: changeHeightElement
    }

    for (const key in attributes) {
      const attr = attributes[key]
      const action = actions[attr.nodeName]

      if (typeof action === 'function') action(attr)
    }
  }
}

window.customElements.define('c-loader', Loader)
