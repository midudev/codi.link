import { $, $$ } from './utils/dom.js'

const $aside = $('aside')
const $buttons = $$('button', $aside)

const ACTIONS = {
  'close-aside-bar': () => {
    $('.aside-bar').setAttribute('hidden', '')
  },

  'show-skypack-bar': () => {
    $('.aside-bar').removeAttribute('hidden')
    $$('.bar-content').forEach(el => el.setAttribute('hidden', ''))
    $('#skypack').removeAttribute('hidden')
  },

  'show-settings-bar': () => {
    $('.aside-bar').removeAttribute('hidden')
    $$('.bar-content').forEach(el => el.setAttribute('hidden', ''))
    $('#settings').removeAttribute('hidden')
  }
}

$buttons.forEach(button => {
  button.addEventListener('click', ({ currentTarget }) => {
    const preActive = currentTarget.classList.contains('is-active')
    $('.is-active').classList.remove('is-active')
    const action = preActive ? 'close-aside-bar' : button.getAttribute('data-action')
    if (preActive) {
      $("button[data-action='close-aside-bar']").classList.add('is-active')
    } else {
      currentTarget.classList.add('is-active')
    }
    ACTIONS[action]()
  })
})
