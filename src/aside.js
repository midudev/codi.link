import { eventBus, EVENTS } from './events-controller.js'
import { $, $$ } from './utils/dom.js'

const $aside = $('aside')
const $buttons = $$('button', $aside)

const SIMPLE_CLICK_ACTIONS = {
  'download-user-code': () => {
    eventBus.emit(EVENTS.DOWNLOAD_USER_CODE)
  },

  'copy-to-clipboard': async () => {
    await navigator.clipboard.writeText(window.location.href)
    window.alert('Sharable URL has been copied to clipboard.')
  }
}

const NON_SIMPLE_CLICK_ACTIONS = {
  'close-aside-bar': () => {
    $('.aside-bar').setAttribute('hidden', '')
    $('.scroll-buttons-container').removeAttribute('hidden')
  },

  'show-skypack-bar': () => {
    showAsideBar('#skypack')
    $('#skypack-search-input').focus()
    $('.scroll-buttons-container').setAttribute('hidden', '')
  },

  'show-layout-settings': () => {
    showAsideBar('#layout')
    $('.scroll-buttons-container').setAttribute('hidden', '')
  },

  'show-settings-bar': () => {
    showAsideBar('#settings')
    $('.scroll-buttons-container').setAttribute('hidden', '')
  }
}

const showAsideBar = (selector) => {
  $('.aside-bar').removeAttribute('hidden')
  $$('.bar-content').forEach(el => el.setAttribute('hidden', ''))
  $(selector).removeAttribute('hidden')
}

const ACTIONS = {
  ...SIMPLE_CLICK_ACTIONS,
  ...NON_SIMPLE_CLICK_ACTIONS
}

$buttons.forEach(button => {
  button.addEventListener('click', ({ currentTarget }) => {
    let action = button.getAttribute('data-action')
    const isSimpleClickAction = button.getAttribute('data-is-simple-click-action') === 'true'

    if (isSimpleClickAction) return ACTIONS[action]()

    const alreadyActive = currentTarget.classList.contains('is-active')
    $('.is-active').classList.remove('is-active')

    action = alreadyActive
      ? 'close-aside-bar'
      : action

    const elementToActive = alreadyActive
      ? $("button[data-action='close-aside-bar']")
      : currentTarget

    elementToActive.classList.add('is-active')
    ACTIONS[action]()
  })
})
