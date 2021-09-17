import Split from 'split-grid'
import { $ } from './utils/dom.js'

const $aside = $('aside')
const asideWidth = $aside.offsetWidth

const marginViewOverlays = 26
const decorationsOverviewRuler = 14
const iconSize = 48
const iconOffset = 16
const columnMinSize = asideWidth - marginViewOverlays + iconSize - iconOffset
const columnMaxSize = window.innerHeight - asideWidth - iconSize + iconOffset - decorationsOverviewRuler

const rowMinSize = iconSize + iconOffset * 2
const rowMaxSize = window.innerHeight - iconSize

Split({
  columnGutters: [{
    track: 1,
    element: $('.vertical-gutter')
  }],
  rowGutters: [{
    track: 1,
    element: $('.horizontal-gutter')
  }],
  columnMinSize,
  columnMaxSize,
  rowMinSize,
  rowMaxSize
})
