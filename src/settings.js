import { $$, setFormControlValue } from './utils/dom.js'
import { getState } from './state.js'

const $settings = $$('#settings [data-for]')

const {
  updateSettings,
  ...settings
} = getState()

$settings.forEach(el => {
  const settingKey = el.getAttribute('data-for')
  const actualSettingValue = settings[settingKey]

  // reflejar en settings la configuración inicial
  setFormControlValue(el, actualSettingValue)

  // escuchar eventos de cambio de settings
  el.addEventListener('change', ({ target }) => {
    const { checked, value } = target
    const isNumber = target.getAttribute('type') === 'number'

    let settingValue = typeof checked === 'boolean' ? checked : value
    if (isNumber) settingValue = +value

    updateSettings({
      key: settingKey,
      value: settingValue
    })
  })
})
