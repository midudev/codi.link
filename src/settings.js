import { $$, setFormControlValue } from './utils/dom.js'
import { useEditorsStore, useSettingsStore } from './state.js'

const ELEMENT_TYPES = {
  INPUT: 'input',
  SELECT: 'select',
  CHECKBOX: 'checkbox'
}

const $settings = $$('#settings [data-for]')

$settings.forEach(el => {
  const settingKey = el.getAttribute('data-for')
  const editorStore = useEditorsStore.getState()
  const { updateStore, ...settings } = (Object.prototype.hasOwnProperty.call(editorStore, settingKey) ? editorStore : useSettingsStore.getState())
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

      updateStore({
        key: settingKey,
        value: settingValue
      })
    })
  } else {
    // Add event listener to default elements
    el.addEventListener('change', ({ target }) => {
      const { value } = target

      updateStore({
        key: settingKey,
        value: value
      })
    })
  }
})
