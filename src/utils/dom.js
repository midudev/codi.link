/* eslint-disable no-return-assign */
export const $ = (selector, context = document) =>
  context.querySelector(selector)

export const $$ = (selector, context = document) =>
  context.querySelectorAll(selector)

const updateSelectValue = (el, value) => {
  const optionToSelect = el.querySelector(`option[value="${value}"]`)
  if (!optionToSelect) return console.warn('Option to initialized not found')
  optionToSelect.setAttribute('selected', '')
}

export const setFormControlValue = (el, value) => {
  const typeHTML = el.nodeName === 'INPUT' && el.type === 'checkbox' ? 'CHECKBOX' : el.nodeName
  const haldlen = {
    SELECT: () => updateSelectValue(el, value),
    CHECKBOX: () => el.checked = value,
    INPUT: () => el.value = value
  }
  haldlen[typeHTML]()
}
