import Split from 'split-grid'
import { $ } from './utils/dom.js'
import { subscribe, getState } from './state'

const $editor = $('#editor')

// inital layout
const { layout } = getState()

// generateLayout(layout);
$editor.setAttribute('class', `${layout}-grid`)

Split({
  columnGutters: [
    {
      track: 1,
      element: $('.gutter-col-1')
    },
    {
      track: 3,
      element: $('.gutter-col-3')
    }
  ],
  rowGutters: [
    {
      track: 1,
      element: $('.gutter-row-1')
    },
    {
      track: 3,
      element: $('.gutter-row-3')
    }
  ]
})

// subscribe to change layout
subscribe((state) => {
  const { layout } = state

  // generateLayout(layout);
  $editor.setAttribute('class', `${layout}-grid`)
})
