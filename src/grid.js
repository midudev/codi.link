import Split from 'split-grid'
import { useSettingsStore } from './state'
import { $, $$ } from './utils/dom'
import { getLocalStorage, setLocalStorage, deleteLocalStorage } from './utils/useLocalStorage'

const $editor = $('#editor')
const $$layoutSelector = $$('layout-preview')
let splitInstance

const formatGutters = gutter => ({
  ...gutter,
  element: $(gutter.element)
})

// Metodo de preservasión de grid
const saveGridTemplate = () => {
  const { preserveGrid } = useSettingsStore.getState()
  if (!preserveGrid) return

  const gridStyles = $('.grid').style

  const gridTemplate = JSON.stringify({
    'grid-template-columns': gridStyles['grid-template-columns'],
    'grid-template-rows': gridStyles['grid-template-rows']
  })

  setLocalStorage('gridTemplate', gridTemplate)
}

const getInitialGridStyle = () => {
  const { preserveGrid } = useSettingsStore.getState()
  if (!preserveGrid) return deleteLocalStorage('gridTemplate')

  const gridTemplate = getLocalStorage('gridTemplate')

  return gridTemplate && `grid-template-columns: ${gridTemplate['grid-template-columns']}; grid-template-rows: ${gridTemplate['grid-template-rows']}`
}

const setGridLayout = ({ gutters, style, type = '' }) => {
  const initialStyle = !splitInstance && getInitialGridStyle()

  $editor.setAttribute('data-layout', type)
  $editor.setAttribute('style', initialStyle || style)

  $$layoutSelector.forEach(layoutEl => {
    if (type === layoutEl.layout) {
      layoutEl.setAttribute('active', '')
    } else {
      layoutEl.removeAttribute('active')
    }
  })

  saveGridTemplate()

  const splitConfig = {
    ...gutters,
    ...gutters.columnGutters && { columnGutters: gutters.columnGutters.map(formatGutters) },
    ...gutters.rowGutters && { rowGutters: gutters.rowGutters.map(formatGutters) },
    onDragEnd: saveGridTemplate
  }

  if (splitInstance) {
    splitInstance.destroy(true)
  }

  splitInstance = Split(splitConfig)
}

export default setGridLayout
