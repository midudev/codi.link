import Split from 'split-grid'
import {
  DEFAULT_GRID_TEMPLATE,
  EDITOR_GRID_TEMPLATE
} from './constants/editor-grid-template'
import {
  BOTTOM_LAYOUT,
  DEFAULT_LAYOUT,
  HORIZONTAL_LAYOUT,
  TABS_LAYOUT,
  VERTICAL_LAYOUT
} from './constants/grid-templates'
import { getState } from './state'
import { $, $$ } from './utils/dom'

const $editor = $('#editor')
const rootElement = document.documentElement
const $$layoutSelector = $$('layout-preview')
const $$editors = $$('#editor codi-editor')
const $tabsContainer = $('#tabs')
const $$tabs = $$('#tabs label')
let splitInstance

const selectTab = (event) => {
  $$editors.forEach($editor => ($editor.style.display = 'none'))
  const $targetEditor = $(`#${event.target.getAttribute('for')}`)
  $targetEditor.style.display = 'block'
  $$tabs.forEach($t => $t.classList.remove('active'))
  event.target.classList.add('active')
}

$$tabs.forEach($tab => {
  $tab.addEventListener('click', selectTab)
})

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

  return (
    gridTemplate &&
    `grid-template-columns: ${gridTemplate['grid-template-columns']}; grid-template-rows: ${gridTemplate['grid-template-rows']}`
  )
}

const configLayoutTabsElements = (type) => {
  if (type === 'tabs') {
    $tabsContainer.removeAttribute('hidden')
    $tabsContainer.style.display = 'grid'
    $tabsContainer.querySelector('label').classList.add('active')
    $('.second-gutter').style.display = 'none'
    $('.last-gutter').style.display = 'none'
    $$editors.forEach(($editor, index) => {
      $editor.style.display = 'none'
      $editor.style.gridArea = 'editors'

      if (index === 0) {
        $editor.style.display = 'block'
      }
    })
  } else {
    $tabsContainer.setAttribute('hidden', 'hidde')
    $tabsContainer.style.display = 'none'
    $('.second-gutter').style.display = 'block'
    $('.last-gutter').style.display = 'block'
    $$editors.forEach(($editor, i) => {
      $editor.style.display = 'block'
      $editor.style.gridArea = $editor.getAttribute('data-grid-area')
    })
  }
}

const setGridLayout = (type = '') => {
  const style = EDITOR_GRID_TEMPLATE[type] || DEFAULT_GRID_TEMPLATE

  const gutters =
    {
      vertical: VERTICAL_LAYOUT,
      horizontal: HORIZONTAL_LAYOUT,
      bottom: BOTTOM_LAYOUT,
      tabs: TABS_LAYOUT
    }[type] ?? DEFAULT_LAYOUT

  configLayoutTabsElements(type)

  const initialStyle = !splitInstance && getInitialGridStyle()

  rootElement.setAttribute('data-layout', type)
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
    ...(gutters.columnGutters && {
      columnGutters: gutters.columnGutters.map(formatGutters)
    }),
    ...(gutters.rowGutters && {
      rowGutters: gutters.rowGutters.map(formatGutters)
    }),
    ...(type === 'tabs' && { columnMinSizes: { 0: 300 } }),
    minSize: 1,
    onDragEnd: saveGridTemplate
  }

  if (splitInstance) {
    splitInstance.destroy(true)
  }

  splitInstance = Split(splitConfig)
}

export default setGridLayout
