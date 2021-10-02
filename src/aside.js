import { $, $$ } from './utils/dom.js'
import { copyUrlToClipboard } from './utils/clipboard.js'

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
    $('#skypack-search-input').focus()
  },

  'show-settings-bar': () => {
    $('.aside-bar').removeAttribute('hidden')
    $$('.bar-content').forEach(el => el.setAttribute('hidden', ''))
    $('#settings').removeAttribute('hidden')
  },

  'share-link': () => {
    copyUrlToClipboard(() => window.alert('Link copied to clipboard'))
  }
}

$buttons.forEach(button => {
  button.addEventListener('click', ({ currentTarget }) => {
    const avoidActiveState = button.getAttribute('data-avoid-active-state') === '1'
    let action = button.getAttribute('data-action')

    if (!avoidActiveState) {
      const alreadyActive = currentTarget.classList.contains('is-active')
      $('.is-active').classList.remove('is-active')

      action = alreadyActive
        ? 'close-aside-bar'
        : button.getAttribute('data-action')

      const elementToActive = alreadyActive
        ? $("button[data-action='close-aside-bar']")
        : currentTarget

      elementToActive.classList.add('is-active')
    }

    ACTIONS[action]()
  })
})
