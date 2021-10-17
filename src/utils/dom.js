export const $ = (selector, context = document) =>
  context.querySelector(selector)

export const $$ = (selector, context = document) =>
  context.querySelectorAll(selector)

export const isNodeSelect = el => el.nodeName === 'SELECT'
export const isNodeCheckbox = el => el.nodeName === 'INPUT' && el.type === 'checkbox'

export const updateSelectValue = (el, value) => {
  const optionToSelect = el.querySelector(`option[value="${value}"]`)
  if (optionToSelect) return optionToSelect.setAttribute('selected', '')
}

export const setFormControlValue = (el, value) => {
  const isSelect = isNodeSelect(el)
  const isCheckbox = isNodeCheckbox(el)

  if (isSelect) updateSelectValue(el, value)
  else if (isCheckbox) el.checked = value
  else el.value = value
}
