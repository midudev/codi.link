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
  },

  'copy-to-clipboard': async () => {
    await navigator.clipboard.writeText(window.location.href)
    window.alert('Sharable URL has been copied to clipboard.')
  }
}

$buttons.forEach(button => {
  button.addEventListener('click', ({ currentTarget }) => {
    let action = currentTarget.getAttribute('data-action')
    const isOffActiveState = currentTarget.getAttribute('data-off-active-state')

    if (!isOffActiveState) {
      const alreadyActive = currentTarget.classList.contains('is-active')
      $('.is-active').classList.remove('is-active')

      action = alreadyActive
        ? 'close-aside-bar'
        : action

      const elementToActive = alreadyActive
        ? $("button[data-action='close-aside-bar']")
        : currentTarget

      elementToActive.classList.add('is-active')
    }

    ACTIONS[action]()
  })
})
