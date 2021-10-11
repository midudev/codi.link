export const $ = (selector, context = document) => context.querySelector(selector)

export const $$ = (selector, context = document) => context.querySelectorAll(selector)

export const isNodeSelect = (el) => el.nodeName === 'SELECT'
export const isNodeCheckbox = (el) => el.nodeName === 'INPUT' && el.type === 'checkbox'

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

export const updateSelectLayout = (el) => {
  const $layouts = $$('#layout .layout-item')

  $layouts.forEach((layout) => layout.classList.remove('active'))
  el.classList.add('active')
}
