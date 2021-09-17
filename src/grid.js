import Split from 'split-grid'
import { $ } from './utils/dom.js'

const $aside = $('aside')
const asideWidth = $aside.offsetWidth

const iconSize = 48
const columnMinSize = asideWidth + iconSize
const columnMaxSize = window.innerHeight - asideWidth - iconSize

const rowMinSize = iconSize
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
