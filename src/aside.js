import { $, $$ } from './utils/dom.js'

const $asideSections = $('.aside-sections')
const $buttons = $$('button', $asideSections)

const ACTIONS = {
  'close-aside-bar': () => {
    $('.aside-bar').setAttribute('hidden', '')
  },

  'show-skypack-bar': () => {
    $('.aside-bar').removeAttribute('hidden')
    $$('.bar-content').forEach(el => el.setAttribute('hidden', ''))
    $('#skypack').removeAttribute('hidden')
    $('#skypack-search-input').focus()
  },

  'show-live-share-bar': () => {
    $('.aside-bar').removeAttribute('hidden')
    $$('.bar-content').forEach(el => el.setAttribute('hidden', ''))
    $('#live-share').removeAttribute('hidden')
  },

  'show-settings-bar': () => {
    $('.aside-bar').removeAttribute('hidden')
    $$('.bar-content').forEach(el => el.setAttribute('hidden', ''))
    $('#settings').removeAttribute('hidden')
  }
}

$buttons.forEach(button => {
  button.addEventListener('click', ({ currentTarget }) => {
    const alreadyActive = currentTarget.classList.contains('is-active')
    $('.is-active').classList.remove('is-active')

    const action = alreadyActive
      ? 'close-aside-bar'
      : button.getAttribute('data-action')

    const elementToActive = alreadyActive
      ? $("button[data-action='close-aside-bar']")
      : currentTarget

    elementToActive.classList.add('is-active')
    ACTIONS[action]()
  })
})
