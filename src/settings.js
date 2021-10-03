import { $$, $, setFormControlValue } from './utils/dom.js'
import { getState } from './state.js'
import setSplitLayout from './grid.js'
import { VERTICAL_LAYOUT, NORMAL_LAYOUT, HORIZONTAL_LAYOUT } from './constants/grid-templates.js'
import { DEFAULT_GRID_TEMPLATE, EDITOR_GRID_TEMPLATE } from './constants/editor-grid-template.js'

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

    const isVerticalLayout = id === 'vertical'
    const isHorizontalLayout = id === 'horizontal'

    const layout = isVerticalLayout ? VERTICAL_LAYOUT : isHorizontalLayout ? HORIZONTAL_LAYOUT : NORMAL_LAYOUT

    setSplitLayout(layout)

    $$layoutSelector.forEach(layoutEl => { layoutEl.className = 'layout-preview' })
    element.classList.add('active')

    $editor.setAttribute('data-layout', id)
    $editor.setAttribute('style', EDITOR_GRID_TEMPLATE[id] || DEFAULT_GRID_TEMPLATE)
  })
})
