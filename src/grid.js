import Split from 'split-grid'
import { $ } from './utils'

Split({
  columnGutters: [{
    track: 1,
    element: $('.vertical-gutter')
  }],
  rowGutters: [{
    track: 1,
    element: $('.horizontal-gutter')
  }]
})
