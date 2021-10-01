import { $, $$ } from './utils/dom.js'

const $aside = $('aside')
const $buttons = $$('button', $aside)

const ACTIONS = {
  'close-aside-bar': () => {
    $('.aside-bar').setAttribute('hidden', '')
    $('.scroll-buttons-container').removeAttribute('hidden')
  },

  'show-skypack-bar': () => {
    $('.aside-bar').removeAttribute('hidden')
    $$('.bar-content').forEach(el => el.setAttribute('hidden', ''))
    $('#skypack').removeAttribute('hidden')
    $('.scroll-buttons-container').setAttribute('hidden', '')
    $('#skypack-search-input').focus()
  },

  'show-settings-bar': () => {
    $('.aside-bar').removeAttribute('hidden')
    $$('.bar-content').forEach(el => el.setAttribute('hidden', ''))
    $('#settings').removeAttribute('hidden')
    $('.scroll-buttons-container').setAttribute('hidden', '')
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
