import { DEFAULT_GRID_TEMPLATE, EDITOR_GRID_TEMPLATE } from './constants/editor-grid-template.js'
import { DEFAULT_LAYOUT, HORIZONTAL_LAYOUT, VERTICAL_LAYOUT, BOTTOM_LAYOUT } from './constants/grid-templates.js'
import { getState } from './state.js'
import { $, setFormControlValue } from './utils/dom.js'

const ELEMENT_TYPES = {
  INPUT: 'input',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio'
}

/**
 * @type {HTMLFormElement}
 */
const $settingsForm = $('#settings')

const {
  updateSettings,
  ...settings
} = getState()

$settingsForm.addEventListener('submit', e => {
  e.preventDefault()
})

$settingsForm.addEventListener('input', updateSettingValue)

$settingsForm.addEventListener('change', updateSettingValue)

Array.from($settingsForm.elements).forEach((el) => {
  const { name: settingKey, value } = el

  if (!settingKey) return

  let actualSettingValue = settings[settingKey]

  if (settingKey === 'layout') {
    if (value === actualSettingValue.type) {
      actualSettingValue = true
    } else { return }
  }

  // Reflect the initial configuration in the settings section.
  setFormControlValue(el, actualSettingValue)
})

function updateSettingValue ({ target }) {
  const { value, checked, name: settingKey } = target

  const isCheckbox = target.type === ELEMENT_TYPES.CHECKBOX
  const isRadio = target.type === ELEMENT_TYPES.RADIO

  let settingValue = isCheckbox ? checked : value

  if (isRadio) {
    if (!checked) { return }
    settingValue = getLayoutValue(value)
  }

  updateSettings({ key: settingKey, value: settingValue })
}

function getLayoutValue (layout) {
  const style = EDITOR_GRID_TEMPLATE[layout] || DEFAULT_GRID_TEMPLATE

  const gutters = {
    vertical: VERTICAL_LAYOUT,
    horizontal: HORIZONTAL_LAYOUT,
    bottom: BOTTOM_LAYOUT
  } ?? DEFAULT_LAYOUT

  return { gutters, style, type: layout }
}
