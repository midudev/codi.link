import { $, $$ } from './utils/dom.js'
import WindowPreviewer from './utils/WindowPreviewer'

const $aside = $('aside')
const $buttons = $$('button', $aside)

const toggleAsideBar = (status) => {
  $('.aside-bar').toggleAttribute('hidden', status)
}

const ACTIONS = {
  'close-aside-bar': () => {
    toggleAsideBar(true)
  },

  'show-skypack-bar': () => {
    toggleAsideBar()
    $$('.bar-content').forEach((el) => el.setAttribute('hidden', ''))
    $('#skypack').removeAttribute('hidden')
  },

  'show-settings-bar': () => {
    toggleAsideBar()
    $$('.bar-content').forEach((el) => el.setAttribute('hidden', ''))
    $('#settings').removeAttribute('hidden')
  },

  'open-iframe-tab': () => {
    WindowPreviewer.openWindow()
  }
}

$buttons.forEach((button) => {
  button.addEventListener('click', ({ currentTarget }) => {
    let action = button.getAttribute('data-action')

    if (action.includes('bar')) {
      const alreadyActive = currentTarget.classList.contains('is-active')
      $('.is-active').classList.remove('is-active')

      alreadyActive && (action = 'close-aside-bar')

      const elementToActive = alreadyActive
        ? $("button[data-action='close-aside-bar']")
        : currentTarget

      elementToActive.classList.add('is-active')
    }

    ACTIONS[action]()
  })
})
