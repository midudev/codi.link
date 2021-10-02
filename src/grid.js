import Split from 'split-grid'
import { $ } from './utils/dom.js'

Split({
  columnGutters: [{
    track: 1,
    element: $('.vertical-gutter')
  }, {
    track: 1,
    element: $('.central-gutter')
  }],
  rowGutters: [{
    track: 1,
    element: $('.horizontal-gutter')
  }, {
    track: 1,
    element: $('.central-gutter')
  }]
})
