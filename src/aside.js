import { $, $$ } from './utils/dom.js'

const $aside = $('aside')
const $views = $$('.view')
const $buttons = $$('button', $aside)

$buttons.forEach(button => {
  button.addEventListener('click', ({ currentTarget }) => {
    $('.is-active').classList.remove('is-active')
    console.log(currentTarget)
    currentTarget.classList.add('is-active')

    const elementIdToShow = button.getAttribute('data-to')

    $views.forEach(view => {
      view.setAttribute('hidden', '')
    })

    $(`#${elementIdToShow}`).removeAttribute('hidden')
  })
})
