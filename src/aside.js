import { eventBus, EVENTS } from './events-controller.js'
import { $, $$ } from './utils/dom.js'
import * as Preview from './utils/WindowPreviewer'
import { BUTTON_ACTIONS } from './constants/button-actions.js'
import { copyToClipboard } from './utils/string.js'

const $aside = $('aside')
const $asideBar = $('.aside-bar')
const $buttons = $$('button', $aside)
const $editorAsideButton = $('#editor-aside-button')

const toggleAsideBar = (isHidden) => {
  $asideBar.toggleAttribute('hidden', isHidden)
}

const SIMPLE_CLICK_ACTIONS = {
  [BUTTON_ACTIONS.downloadUserCode]: () => {
    eventBus.emit(EVENTS.DOWNLOAD_USER_CODE)
  },

  [BUTTON_ACTIONS.openIframeTab]: () => {
    Preview.showPreviewerWindow()
  },

  [BUTTON_ACTIONS.copyToClipboard]: async () => {
    const url = new URL(window.location.href)
    const urlToCopy = `https://codi.link${url.pathname}`
    copyToClipboard(urlToCopy)
  },

  [BUTTON_ACTIONS.clearHistory]: () => {
    eventBus.emit(EVENTS.CLEAR_HISTORY)
  },

  [BUTTON_ACTIONS.openNewInstance]: () => {
    eventBus.emit(EVENTS.OPEN_NEW_INSTANCE)
  }
}

const NON_SIMPLE_CLICK_ACTIONS = {
  [BUTTON_ACTIONS.closeAsideBar]: () => {
    toggleAsideBar(true)
    $('.scroll-buttons-container').removeAttribute('hidden')
  },

  [BUTTON_ACTIONS.showSkypackBar]: () => {
    showAsideBar('#skypack')
    $('#skypack-search-input').focus()
    $('.scroll-buttons-container').setAttribute('hidden', '')
  },

  [BUTTON_ACTIONS.showSettingsBar]: () => {
    showAsideBar('#settings')
    $('.scroll-buttons-container').setAttribute('hidden', '')
  },
  [BUTTON_ACTIONS.showConsoleBar]: () => {
    showAsideBar('#console')
    $('.scroll-buttons-container').setAttribute('hidden', '')
  },

  [BUTTON_ACTIONS.showHistoryBar]: () => {
    showAsideBar('#history')
    $('.scroll-buttons-container').setAttribute('hidden', '')
  }
}

const showAsideBar = (selector) => {
  $asideBar.removeAttribute('hidden')
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

    const buttonToActive = alreadyActive ? $editorAsideButton : currentTarget
    buttonToActive.classList.add('is-active')

    action = alreadyActive
      ? 'close-aside-bar'
      : action

    ACTIONS[action]()
  })
})
