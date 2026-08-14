import { eventBus, EVENTS } from './events-controller.js'
import { $, $$ } from './utils/dom.js'
import * as Preview from './utils/WindowPreviewer.js'
import { BUTTON_ACTIONS } from './constants/button-actions.js'
import { resetConsoleBadge } from './console.js'

const $aside = $('aside')
const $asideBar = $('.aside-bar')
const $buttons = $$('button', $aside)
const $editorAsideButton = $('#editor-aside-button')
const $scrollButtons = $('.scroll-buttons-container')

const toggleAsideBar = isHidden => {
  $asideBar.toggleAttribute('hidden', isHidden)
}

const SIMPLE_CLICK_ACTIONS = {
  [BUTTON_ACTIONS.downloadUserCode]: () => {
    eventBus.emit(EVENTS.DOWNLOAD_USER_CODE)
  },

  [BUTTON_ACTIONS.openIframeTab]: () => {
    Preview.showPreviewerWindow()
  },

  [BUTTON_ACTIONS.copyToClipboard]: () => {
    eventBus.emit(EVENTS.COPY_CURRENT_CODE_URL)
  },

  [BUTTON_ACTIONS.clearHistory]: () => {
    eventBus.emit(EVENTS.CLEAR_HISTORY)
  },

  [BUTTON_ACTIONS.openNewInstance]: () => {
    eventBus.emit(EVENTS.OPEN_NEW_INSTANCE)
  }
}

const PANEL_LOADERS = {
  [BUTTON_ACTIONS.showSkypackBar]: () => import('./skypack.js'),
  [BUTTON_ACTIONS.showSettingsBar]: () => import('./settings.js'),
  [BUTTON_ACTIONS.showDemosBar]: () => import('./demos.js')
}

const loadedPanels = new Set()

const ensurePanelLoaded = (action) => {
  const load = PANEL_LOADERS[action]
  if (!load || loadedPanels.has(action)) return Promise.resolve()

  return load().then(() => {
    loadedPanels.add(action)
  })
}

const NON_SIMPLE_CLICK_ACTIONS = {
  [BUTTON_ACTIONS.closeAsideBar]: () => {
    toggleAsideBar(true)
    $scrollButtons.removeAttribute('hidden')
  },

  [BUTTON_ACTIONS.showSkypackBar]: () => {
    showAsideBar('#skypack')
    $('#skypack-search-input').focus()
    $scrollButtons.setAttribute('hidden', '')
  },

  [BUTTON_ACTIONS.showSettingsBar]: () => {
    showAsideBar('#settings')
    $scrollButtons.setAttribute('hidden', '')
  },
  [BUTTON_ACTIONS.showConsoleBar]: () => {
    showAsideBar('#console')
    $scrollButtons.setAttribute('hidden', '')
    resetConsoleBadge()
  },

  [BUTTON_ACTIONS.showHistoryBar]: () => {
    showAsideBar('#history')
    $scrollButtons.setAttribute('hidden', '')
  },

  [BUTTON_ACTIONS.showDemosBar]: () => {
    showAsideBar('#demos')
    $scrollButtons.setAttribute('hidden', '')
  }
}

const showAsideBar = selector => {
  $asideBar.removeAttribute('hidden')
  $$('.bar-content').forEach(el => el.setAttribute('hidden', ''))
  $(selector).removeAttribute('hidden')
}

const ACTIONS = {
  ...SIMPLE_CLICK_ACTIONS,
  ...NON_SIMPLE_CLICK_ACTIONS
}

const runAction = async (action) => {
  await ensurePanelLoaded(action)
  ACTIONS[action]()
}

$buttons.forEach(button => {
  button.addEventListener('click', ({ currentTarget }) => {
    let action = button.getAttribute('data-action')
    const isSimpleClickAction =
      button.getAttribute('data-is-simple-click-action') === 'true'

    if (isSimpleClickAction) return runAction(action)

    const alreadyActive = currentTarget.classList.contains('is-active')
    $('.is-active').classList.remove('is-active')

    const buttonToActive = alreadyActive ? $editorAsideButton : currentTarget
    buttonToActive.classList.add('is-active')

    action = alreadyActive ? 'close-aside-bar' : action

    runAction(action)
  })
})
