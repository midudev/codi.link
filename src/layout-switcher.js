import { BUTTON_ACTIONS } from './constants/button-actions.js'
import { getState, subscribe } from './state.js'
import { $, $$ } from './utils/dom.js'
import { getLayoutType, isMobileLayout } from './utils/layout.js'

const $switcher = $('#layout-switcher')
const $toggle = $(`button[data-action='${BUTTON_ACTIONS.toggleLayoutSwitcher}']`)
const $iconPreview = $('.layout-preview-icon', $toggle)

const syncLayoutControls = (type) => {
  $$('input[name="layout"]').forEach((input) => {
    input.checked = input.value === type
  })

  $$('.layout-option').forEach((option) => {
    option.classList.toggle('is-active', option.dataset.layout === type)
    option.setAttribute('aria-pressed', String(option.dataset.layout === type))
  })

  if ($iconPreview) $iconPreview.dataset.layout = type
}

export const closeLayoutSwitcher = () => {
  $switcher.setAttribute('hidden', '')
  $toggle?.classList.remove('is-open')
  $toggle?.setAttribute('aria-expanded', 'false')
}

const positionSwitcher = () => {
  const parent = $switcher.offsetParent
  if (!parent || !$toggle) return

  const toggleRect = $toggle.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()

  $switcher.style.left = `${toggleRect.right - parentRect.left + 8}px`
  $switcher.style.top = `${toggleRect.top + toggleRect.height / 2 - parentRect.top}px`
}

export const toggleLayoutSwitcher = () => {
  if (isMobileLayout()) return

  const willOpen = $switcher.hasAttribute('hidden')
  $switcher.toggleAttribute('hidden', !willOpen)
  $toggle?.classList.toggle('is-open', willOpen)
  $toggle?.setAttribute('aria-expanded', String(willOpen))

  if (willOpen) {
    syncLayoutControls(getLayoutType(getState().layout))
    positionSwitcher()
  }
}

const applyLayout = (type) => {
  if (!type || isMobileLayout()) return

  getState().updateSettings({ key: 'layout', value: type })
  syncLayoutControls(type)
  closeLayoutSwitcher()
}

$switcher.addEventListener('click', ({ target }) => {
  const option = target.closest('[data-layout]')
  if (!option) return

  applyLayout(option.dataset.layout)
})

document.addEventListener('pointerdown', ({ target }) => {
  if ($switcher.hasAttribute('hidden')) return
  if ($switcher.contains(target) || $toggle?.contains(target)) return

  closeLayoutSwitcher()
})

document.addEventListener('keydown', ({ key }) => {
  if (key === 'Escape') closeLayoutSwitcher()
})

syncLayoutControls(getLayoutType(getState().layout))

subscribe((state) => {
  syncLayoutControls(getLayoutType(state.layout))
})
