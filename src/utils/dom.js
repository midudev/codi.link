/* eslint-env browser */

/**
 * Obtains the DOM element or NodeList from the provided selector.
 * @param {DOMString} target A CSS selector.
 * @returns {Element|NodeList} A DOM element or a list of DOM elements.
 */
export const $ = (target) => {
  // verify if $ property is already defined in HTMLElement.prototype
  if (!HTMLElement.prototype.$) {
    /**
     * Add "$" method to HTMLElement interface.
     * Now we can use parentNode.$("target") to find a DOM element.
     */
    Object.defineProperty(HTMLElement.prototype, '$', {
      value: $
    })
  }

  if (target.length === 0) return undefined

  const selected =
    this instanceof HTMLElement
      ? this.querySelectorAll(target)
      : document.querySelectorAll(target)

  const isArr = selected instanceof NodeList && Array.from(selected).length > 1

  return isArr ? selected : selected[0]
}

export const isNodeSelect = el => el.nodeName === 'SELECT'
export const isNodeCheckbox = el => el.nodeName === 'INPUT' && el.type === 'checkbox'

const updateSelectValue = (el, value) => {
  const optionToSelect = el.querySelector(`option[value="${value}"]`)
  if (!optionToSelect) return console.warn('Option to initialized not found')
  optionToSelect.setAttribute('selected', '')
}

export const setFormControlValue = (el, value) => {
  const isSelect = isNodeSelect(el)
  const isCheckbox = isNodeCheckbox(el)

  if (isSelect) updateSelectValue(el, value)
  else if (isCheckbox) el.checked = value
  else el.value = value
}