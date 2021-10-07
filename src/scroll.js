import { $ } from './utils/dom.js'

const $editor = $('#editor')
const $buttonUp = $('.button-up')
const $buttonDown = $('.button-down')
const editorHeight = window.innerHeight - 75

$buttonUp.addEventListener('click', () => {
  $editor.scrollTop -= editorHeight
})

$buttonDown.addEventListener('click', () => {
  $editor.scrollTop += editorHeight
})

$editor.addEventListener('scroll', () => {
  const $aside = $('aside')
  if ($editor.scrollTop >= (editorHeight) * 3) {
    $aside.style.top = '-80px'
    $editor.style.margin = '0'
  } else {
    $aside.style.top = '0'
    $editor.style.margin = '75px 0 0'
  }
})
