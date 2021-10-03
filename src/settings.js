import { DEFAULT_GRID_TEMPLATE, EDITOR_GRID_TEMPLATE } from './constants/editor-grid-template.js'
import { DEFAULT_LAYOUT, HORIZONTAL_LAYOUT, VERTICAL_LAYOUT } from './constants/grid-templates.js'
import { getState } from './state.js'
import { $$, setFormControlValue } from './utils/dom.js'

const $settings = $$('#settings [data-for]')
const $$layoutSelector = $$('.layout-preview')

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
    const { id: type } = element

    const isVerticalLayout = type === 'vertical'
    const isHorizontalLayout = type === 'horizontal'

    const layout = isVerticalLayout ? VERTICAL_LAYOUT : isHorizontalLayout ? HORIZONTAL_LAYOUT : DEFAULT_LAYOUT

    updateSettings({
      key: 'layout',
      value: {
        gutters: layout,
        style: EDITOR_GRID_TEMPLATE[type] || DEFAULT_GRID_TEMPLATE,
        type
      }
    })
  })
})
