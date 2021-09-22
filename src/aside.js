import { $, $$ } from './utils/dom.js'

const $aside = $('aside')
const $buttons = $$('button', $aside)

const hideBarContent = (target) => {
  $$(`.bar-content:not(.${target})`).forEach(el => el.setAttribute('hidden', ''))
  $$(`[data-target]:not([data-target="${target}"])`).forEach(el => el.classList.remove('is-active'))
}

$buttons.forEach(button => {
  button.addEventListener('click', ({ currentTarget }) => {
    const isBarVisible = currentTarget.classList.contains('is-active')
    const target = button.getAttribute('data-target')

    if (target === 'editor') {
      currentTarget.classList.add('is-active')
      $('.aside-bar').setAttribute('hidden', '')
      hideBarContent(target)
      return
    }
    currentTarget.classList.toggle('is-active', !isBarVisible)

    if (isBarVisible) {
      $(`#${target}`).setAttribute('hidden', '')
      $('.aside-bar').setAttribute('hidden', '')
      $$('.bar-content').forEach(el => el.setAttribute('hidden', ''))
    } else {
      $(`#${target}`).removeAttribute('hidden')
      $('.aside-bar').removeAttribute('hidden')
      hideBarContent(target)
    }
  })
})
