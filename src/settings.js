import { DEFAULT_GRID_TEMPLATE, EDITOR_GRID_TEMPLATE } from './constants/editor-grid-template.js'
import { DEFAULT_LAYOUT, HORIZONTAL_LAYOUT, VERTICAL_LAYOUT, BOTTOM_LAYOUT } from './constants/grid-templates.js'
import { getState } from './state.js'
import { $$, setFormControlValue } from './utils/dom.js'

const ELEMENT_TYPES = {
  INPUT: 'input',
  SELECT: 'select',
  CHECKBOX: 'checkbox'
}

const $settings = $$('#settings [data-for]')
const $$layoutSelector = $$('layout-preview')

const {
  updateSettings,
  ...settings
} = getState()

$settings.forEach(el => {
  const settingKey = el.getAttribute('data-for')
  const actualSettingValue = settings[settingKey]

  // Reflect the initial configuration in the settings section.
  setFormControlValue(el, actualSettingValue)

  const elementTagName = el.tagName.toLowerCase()

  if (elementTagName === ELEMENT_TYPES.INPUT) {
    // Add event lister to input elements
    el.addEventListener('input', ({ target }) => {
      const { value, checked } = target
      const isCheckbox = target.type === ELEMENT_TYPES.CHECKBOX

      const settingValue = isCheckbox ? checked : value

      updateSettings({
        key: settingKey,
        value: settingValue
      })
    })
  } else {
    // Add event listener to default elements
    el.addEventListener('change', ({ target }) => {
      const { value } = target

      updateSettings({
        key: settingKey,
        value: value
      })
    })
  }
})

$$layoutSelector.forEach(layoutEl => {
  layoutEl.addEventListener('click', ({ target }) => {
    const { layout } = target

    const style = EDITOR_GRID_TEMPLATE[layout] || DEFAULT_GRID_TEMPLATE
    let gutters

    switch (layout) {
      case 'vertical': gutters = VERTICAL_LAYOUT; break
      case 'horizontal': gutters = HORIZONTAL_LAYOUT; break
      case 'bottom': gutters = BOTTOM_LAYOUT; break
      default: gutters = DEFAULT_LAYOUT
    }

    updateSettings({
      key: 'layout',
      value: { gutters, style, type: layout }
    })
  })
})
