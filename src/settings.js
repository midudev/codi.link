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

$settingsForm.addEventListener('submit', e => e.preventDefault())
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

  const settingValue = isCheckbox ? checked : value

  if (isRadio) {
    if (!checked) { return }
  }

  updateSettings({ key: settingKey, value: settingValue })
}
