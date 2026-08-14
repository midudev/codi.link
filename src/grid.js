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
import {
  clearMosaicStyles,
  createMosaicSplit,
  DEFAULT_RATIOS,
  trackRatio
} from './mosaic-split.js'
import { getState } from './state'
import { $, $$ } from './utils/dom'
import { getLayoutType, isMobileLayout, isNestedLayout, MOBILE_LAYOUT_QUERY } from './utils/layout.js'

const $editor = $('#editor')
const $markup = $('#markup')
const $script = $('#script')
const $style = $('#style')
const $preview = $('#editor-preview')
const $gutterColA = $('.gutter-col-a')
const $gutterColB = $('.gutter-col-b')
const $gutterRowA = $('.gutter-row-a')
const $gutterRowB = $('.gutter-row-b')
const $gutterCenter = $('.gutter-center')
const mosaicElements = [
  $markup,
  $script,
  $style,
  $preview,
  $gutterColA,
  $gutterColB,
  $gutterRowA,
  $gutterRowB,
  $gutterCenter
]
const rootElement = document.documentElement
const $$layoutSelector = $$('.layout-preview:not(.layout-preview-icon)')
const $$editors = $$('#editor .editor')
const $tabsContainer = $('#tabs')
const $$tabs = $$('#tabs label')
const $previewTab = $('#tabs [for="editor-preview"]')
let splitInstances = []
let mosaicSplit = null
let hasInitialized = false

const FLAT_GUTTERS = {
  vertical: VERTICAL_LAYOUT,
  horizontal: HORIZONTAL_LAYOUT,
  bottom: BOTTOM_LAYOUT,
  tabs: TABS_LAYOUT
}

const mosaicPanes = (type) => (
  type === 'layout-2'
    ? { tl: $markup, tr: $style, bl: $script, br: $preview }
    : { tl: $markup, tr: $script, bl: $style, br: $preview }
)

const selectTab = event => {
  const tab = event.currentTarget
  const targetId = tab.getAttribute('for')
  const $target = $(`#${targetId}`)
  const mobile = isMobileLayout()

  $$editors.forEach($editor => {
    $editor.style.display = 'none'
  })

  if (targetId === 'editor-preview') {
    $preview.style.display = 'block'
  } else {
    $preview.style.display = mobile ? 'none' : ''
    $target.style.display = 'block'
    $target.editorHandle?.ensureCreated()?.then(() => {
      $target.editorHandle?.layout()
    })
  }

  $$tabs.forEach($t => $t.classList.remove('active'))
  tab.classList.add('active')
}

$$tabs.forEach($tab => {
  $tab.addEventListener('click', selectTab)
})

const formatGutters = gutter => ({
  ...gutter,
  element: $(gutter.element)
})

const toStyle = ({ 'grid-template-columns': columns, 'grid-template-rows': rows } = {}) => {
  const parts = []
  if (columns) parts.push(`grid-template-columns: ${columns}`)
  if (rows) parts.push(`grid-template-rows: ${rows}`)
  return parts.join('; ')
}

const toFlexibleTracks = (value) => {
  if (!value || !value.includes('px')) return value

  const tracks = value.trim().split(/\s+/)
  const sizes = tracks.map((track) => {
    if (!track.endsWith('px')) return null
    const px = parseFloat(track)
    return px > 8 ? px : null
  })
  const pixelSum = sizes.reduce((total, px) => total + (px || 0), 0)
  const largePx = sizes.filter(Boolean)
  if (largePx.length < 2 || !pixelSum) return value

  return tracks
    .map((track, index) => (sizes[index] == null ? track : `${sizes[index] / pixelSum}fr`))
    .join(' ')
}

const readGridStyle = (element) => ({
  'grid-template-columns': toFlexibleTracks(element.style.gridTemplateColumns),
  'grid-template-rows': toFlexibleTracks(element.style.gridTemplateRows)
})

const applyEditorCssVars = (editor = {}) => {
  const columns = toFlexibleTracks(editor['grid-template-columns'])
  const rows = toFlexibleTracks(editor['grid-template-rows'])
  if (columns) rootElement.style.setProperty('--editor-columns', columns)
  if (rows) rootElement.style.setProperty('--editor-rows', rows)
}

const applyMosaicCssVars = (ratios = DEFAULT_RATIOS) => {
  rootElement.style.setProperty('--mosaic-top', ratios.top)
  rootElement.style.setProperty('--mosaic-bottom', ratios.bottom)
  rootElement.style.setProperty('--mosaic-left', ratios.left)
  rootElement.style.setProperty('--mosaic-right', ratios.right)
}

const saveGridTemplate = () => {
  if (isMobileLayout()) return

  const { preserveGrid } = getState()
  if (!preserveGrid) return

  const type = rootElement.getAttribute('data-layout') || 'tabs'
  const gridTemplate = {
    version: 3,
    type,
    editor: readGridStyle($editor)
  }

  if (isNestedLayout(type) && mosaicSplit) {
    gridTemplate.mosaic = mosaicSplit.getRatios()
    applyMosaicCssVars(gridTemplate.mosaic)
  } else {
    applyEditorCssVars(gridTemplate.editor)
  }

  window.localStorage.setItem('gridTemplate', JSON.stringify(gridTemplate))
}

const parseSavedGrid = () => {
  try {
    return JSON.parse(window.localStorage.getItem('gridTemplate'))
  } catch {
    return null
  }
}

const ratiosFromSaved = (saved, type) => {
  if (!saved || !getState().preserveGrid) return { ...DEFAULT_RATIOS }
  if (saved.mosaic) return { ...DEFAULT_RATIOS, ...saved.mosaic }
  if (saved.version === 2 && saved.type === type) {
    return {
      top: trackRatio(saved.rowA?.['grid-template-columns']),
      bottom: trackRatio(saved.rowB?.['grid-template-columns']),
      left: trackRatio(saved.editor?.['grid-template-rows']),
      right: trackRatio(saved.editor?.['grid-template-rows'])
    }
  }
  if (!saved.version) {
    return {
      top: trackRatio(saved['grid-template-columns']),
      bottom: trackRatio(saved['grid-template-columns']),
      left: trackRatio(saved['grid-template-rows']),
      right: trackRatio(saved['grid-template-rows'])
    }
  }
  return { ...DEFAULT_RATIOS }
}

const applySavedFlatStyles = (type) => {
  const { preserveGrid } = getState()
  if (!preserveGrid) {
    window.localStorage.removeItem('gridTemplate')
    return false
  }

  const saved = parseSavedGrid()
  if (!saved || saved.type !== type) return false

  if (saved.version >= 2 && saved.editor) {
    const editor = {
      'grid-template-columns': toFlexibleTracks(saved.editor['grid-template-columns']),
      'grid-template-rows': toFlexibleTracks(saved.editor['grid-template-rows'])
    }
    const style = toStyle(editor)
    if (!style) return false
    $editor.setAttribute('style', style)
    applyEditorCssVars(editor)
    return true
  }

  const legacy = {
    'grid-template-columns': toFlexibleTracks(saved['grid-template-columns']),
    'grid-template-rows': toFlexibleTracks(saved['grid-template-rows'])
  }
  const legacyStyle = toStyle(legacy)
  if (!legacyStyle) return false
  $editor.setAttribute('style', legacyStyle)
  applyEditorCssVars(legacy)
  return true
}

const resetPreviewPane = () => {
  $preview.style.display = ''
  $preview.style.gridArea = ''
}

const configLayoutTabsElements = type => {
  if (type === 'tabs') {
    const mobile = isMobileLayout()
    $tabsContainer.removeAttribute('hidden')
    $tabsContainer.style.display = 'grid'
    $previewTab?.toggleAttribute('hidden', !mobile)
    $$tabs.forEach($t => $t.classList.remove('active'))
    $tabsContainer.querySelector('label').classList.add('active')
    $$editors.forEach(($editor, index) => {
      $editor.style.display = 'none'
      $editor.style.gridArea = 'editors'

      if (index === 0) {
        $editor.style.display = 'block'
        $editor.editorHandle?.ensureCreated()
      }
    })

    if (mobile) {
      $preview.style.display = 'none'
      $preview.style.gridArea = 'editors'
    } else {
      resetPreviewPane()
    }
    return
  }

  $tabsContainer.setAttribute('hidden', '')
  $tabsContainer.style.display = 'none'
  $previewTab?.setAttribute('hidden', '')
  resetPreviewPane()
  $$editors.forEach(($editor) => {
    $editor.editorHandle?.ensureCreated()
    $editor.style.display = 'block'
    $editor.style.gridArea = isNestedLayout(type)
      ? ''
      : $editor.getAttribute('data-grid-area')
  })
}

const createSplit = (gutters) => Split({
  ...gutters,
  ...(gutters.columnGutters && {
    columnGutters: gutters.columnGutters.map(formatGutters)
  }),
  ...(gutters.rowGutters && {
    rowGutters: gutters.rowGutters.map(formatGutters)
  }),
  minSize: 1,
  onDragEnd: saveGridTemplate
})

const destroySplits = () => {
  splitInstances.forEach(instance => instance.destroy(true))
  splitInstances = []
  if (mosaicSplit) {
    mosaicSplit.destroy()
    mosaicSplit = null
  }
  clearMosaicStyles(mosaicElements)
}

const setGridLayout = (layout = '') => {
  const userType = getLayoutType(layout)
  const mobile = isMobileLayout()
  const type = mobile ? 'tabs' : userType
  const nested = isNestedLayout(type)
  const style = EDITOR_GRID_TEMPLATE[mobile ? 'tabs-mobile' : type] || DEFAULT_GRID_TEMPLATE
  const wasMobile = rootElement.hasAttribute('data-mobile-layout')
  const saved = (!hasInitialized || wasMobile) ? parseSavedGrid() : null

  const previousMosaicRatios = mosaicSplit?.getRatios()
  configLayoutTabsElements(type)
  destroySplits()

  rootElement.setAttribute('data-layout', type)
  rootElement.toggleAttribute('data-mobile-layout', mobile)

  const activeType = mobile ? userType : type
  $$layoutSelector.forEach(layoutEl => {
    if (activeType === layoutEl.getAttribute('data-layout')) {
      layoutEl.setAttribute('active', 'true')
    } else {
      layoutEl.removeAttribute('active')
    }
  })

  if (mobile) {
    rootElement.removeAttribute('data-mosaic')
    $editor.setAttribute('style', style)
    hasInitialized = true
    return
  }

  if (nested) {
    $editor.removeAttribute('style')
    rootElement.setAttribute('data-mosaic', '')
    const initialRatios = previousMosaicRatios || ((!hasInitialized || wasMobile) ? ratiosFromSaved(saved, type) : DEFAULT_RATIOS)
    applyMosaicCssVars(initialRatios)
    mosaicSplit = createMosaicSplit({
      container: $editor,
      panes: mosaicPanes(type),
      gutters: {
        colTop: $gutterColA,
        colBottom: $gutterColB,
        rowLeft: $gutterRowA,
        rowRight: $gutterRowB,
        center: $gutterCenter
      },
      initialRatios,
      onDragEnd: saveGridTemplate
    })
    hasInitialized = true
    saveGridTemplate()
    return
  }

  rootElement.removeAttribute('data-mosaic')

  const restored = (!hasInitialized || wasMobile) && applySavedFlatStyles(type)
  hasInitialized = true
  const bootstrappedColumns = rootElement.style.getPropertyValue('--editor-columns')
  const bootstrappedRows = rootElement.style.getPropertyValue('--editor-rows')
  if (!restored) {
    if (bootstrappedColumns || bootstrappedRows) {
      if (bootstrappedColumns) $editor.style.gridTemplateColumns = bootstrappedColumns
      if (bootstrappedRows) $editor.style.gridTemplateRows = bootstrappedRows
    } else {
      $editor.setAttribute('style', style)
    }
  }

  saveGridTemplate()

  const gutters = FLAT_GUTTERS[type] ?? DEFAULT_LAYOUT
  splitInstances = [createSplit({
    ...gutters,
    ...(type === 'tabs' && { columnMinSizes: { 0: 300 } })
  })]
}

window.matchMedia(MOBILE_LAYOUT_QUERY).addEventListener('change', () => {
  setGridLayout(getState().layout)
})

export default setGridLayout
