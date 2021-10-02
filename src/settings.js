import { $$, $, setFormControlValue } from './utils/dom.js'
import { getState } from './state.js'

const $settings = $$('#settings [data-for]')
const $$layoutSelector = $$('.layout-preview')
const $editor = $('#editor')

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

$$layoutSelector.forEach(layoutEl => {
  layoutEl.addEventListener('click', ({ target }) => {
    const element = target.className === 'layout-preview' ? target : target.closest('.layout-preview')
    const { id } = element

    $$layoutSelector.forEach(layoutEl => { layoutEl.className = 'layout-preview' })
    element.classList.add('active')

    $editor.setAttribute('data-layout', id)
  })
})
