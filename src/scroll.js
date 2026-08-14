import { $ } from './utils/dom.js'

const $buttonUp = $('.button-up')
const $buttonDown = $('.button-down')

const previewersId = ['editor-preview', 'markup', 'script', 'style']
let currentPreviewer = 0

const updateButtonsStatus = (index) => {
  $buttonUp.disabled = index === 0
  $buttonDown.disabled = index === previewersId.length - 1
}

const updatePreviewer = (activeIndex) => {
  previewersId.forEach((previewer, index) => {
    const element = $(`#${previewer}`)

    if (activeIndex === index) {
      element.classList.remove('previewer-hide')
      element.classList.add('previewer-active')
    } else {
      element.classList.add('previewer-hide')
      element.classList.remove('previewer-active')
    }
  })
}

$buttonUp.addEventListener('click', () => {
  currentPreviewer -= 1
  updateButtonsStatus(currentPreviewer)
  updatePreviewer(currentPreviewer)
})

$buttonDown.addEventListener('click', () => {
  currentPreviewer += 1
  updateButtonsStatus(currentPreviewer)
  updatePreviewer(currentPreviewer)
})

updateButtonsStatus(currentPreviewer)
