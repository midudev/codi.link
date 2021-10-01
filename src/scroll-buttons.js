import { $ } from './utils/dom.js'

const $editor = $('#editor')
const $buttonUp = $('.button-up')
const $buttonDown = $('.button-down')

$buttonUp.addEventListener('click', () => { $editor.scrollTop -= window.innerHeight })
$buttonDown.addEventListener('click', () => { $editor.scrollTop += window.innerHeight })
