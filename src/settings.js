import { $$, setFormControlValue } from './utils'
import { getState } from './state.js'

const ELEMENT_TYPES = {
  INPUT: 'input',
  SELECT: 'select',
  CHECKBOX: 'checkbox'
}

const $settings = $$('#settings [data-for]')

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
