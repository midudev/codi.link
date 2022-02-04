import Split from 'split-grid'
import { DEFAULT_GRID_TEMPLATE, EDITOR_GRID_TEMPLATE } from './constants/editor-grid-template'
import { BOTTOM_LAYOUT, DEFAULT_LAYOUT, HORIZONTAL_LAYOUT, VERTICAL_LAYOUT } from './constants/grid-templates'
import { getState } from './state'
import { $, $$ } from './utils/dom'

const $editor = $('#editor')
const $$layoutSelector = $$('layout-preview')
let splitInstance

const formatGutters = gutter => ({
  ...gutter,
  element: $(gutter.element)
})

// Metodo de preservasión de grid
const saveGridTemplate = () => {
  const { preserveGrid } = getState()
  if (!preserveGrid) return

  const gridStyles = $('.grid').style

  const gridTemplate = JSON.stringify({
    'grid-template-columns': gridStyles['grid-template-columns'],
    'grid-template-rows': gridStyles['grid-template-rows']
  })

  window.localStorage.setItem('gridTemplate', gridTemplate)
}

const getInitialGridStyle = () => {
  const { preserveGrid } = getState()
  if (!preserveGrid) return window.localStorage.removeItem('gridTemplate')

  const gridTemplate = JSON.parse(window.localStorage.getItem('gridTemplate'))

  return gridTemplate && `grid-template-columns: ${gridTemplate['grid-template-columns']}; grid-template-rows: ${gridTemplate['grid-template-rows']}`
}

const setGridLayout = (type = '') => {
  const style = EDITOR_GRID_TEMPLATE[type] || DEFAULT_GRID_TEMPLATE

  const gutters = {
    vertical: VERTICAL_LAYOUT,
    horizontal: HORIZONTAL_LAYOUT,
    bottom: BOTTOM_LAYOUT
  }[type] ?? DEFAULT_LAYOUT

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
