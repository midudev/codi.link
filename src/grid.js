import Split from 'split-grid'
import { $, $$ } from './utils/dom'

const $editor = $('#editor')
const $$layoutSelector = $$('.layout-preview')

let splitInstance

const formatGutters = gutter => ({
  ...gutter,
  element: $(gutter.element)
})

const setGridLayout = ({ gutters, style, type = '' }) => {
  $editor.setAttribute('data-layout', type)
  $editor.setAttribute('style', style)

  $$layoutSelector.forEach(layoutEl => {
    layoutEl.className = type === layoutEl.id ? 'layout-preview active' : 'layout-preview'
  })

  gutters = {
    ...gutters,
    ...gutters.columnGutters && { columnGutters: gutters.columnGutters.map(formatGutters) },
    ...gutters.rowGutters && { rowGutters: gutters.rowGutters.map(formatGutters) }
  }

  if (splitInstance) {
    splitInstance.destroy(true)
  }

  splitInstance = Split(gutters)
}

export default setGridLayout
