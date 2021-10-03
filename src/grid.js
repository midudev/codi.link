import Split from 'split-grid'
import { $, $$ } from './utils/dom.js'
import { subscribe, getState } from './state'

const $editor = $('#editor')
const $layouts = $$('#layout .layout-item')

// initial layout
const { layout } = getState()

$layouts.forEach((el) => {
  el.classList.remove('active')

  if (el.getAttribute('data-layout') === layout) {
    el.classList.add('active')
  }
})

$editor.setAttribute('class', `${layout}-grid`)

// initializing split
Split({
  columnGutters: [
    {
      track: 1,
      element: $('.gutter-col-1')
    },
    {
      track: 3,
      element: $('.gutter-col-3')
    },
    {
      track: 1,
      element: $('.central-gutter-1')
    },
    {
      track: 3,
      element: $('.central-gutter-3')
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
    },
    {
      track: 1,
      element: $('.central-gutter-1')
    },
    {
      track: 3,
      element: $('.central-gutter-3')
    }
  ]
})

// subscribe to change layout
subscribe((state) => {
  const { layout } = state

  $editor.setAttribute('class', `${layout}-grid`)

  // removing previous layout grid inline styles
  $editor.removeAttribute('style')
})
