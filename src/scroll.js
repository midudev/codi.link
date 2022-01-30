import { $ } from './utils/dom.js'

const $buttonUp = $('.button-up')
const $buttonDown = $('.button-down')

const previewersId = ['editor-preview', 'markup', 'script', 'style']
let curretPreviewer = 0

const updateButtonsStatus = (curretPreviewer) => {
  $buttonUp.disabled = curretPreviewer === 0
  $buttonDown.disabled = curretPreviewer === previewersId.length - 1
}

const updatePreviewer = (curretPreviewer) => {
  previewersId.forEach((previewer, index) => {
    const element = $(`#${previewer}`)

    if (curretPreviewer === index) {
      element.classList.remove('previewer-hide')
      element.classList.add('previewer-active')
    } else {
      element.classList.add('previewer-hide')
      element.classList.remove('previewer-active')
    }
  })
}

$buttonUp.addEventListener('click', (ev) => {
  curretPreviewer -= 1
  updateButtonsStatus(curretPreviewer)
  updatePreviewer(curretPreviewer)
})

$buttonDown.addEventListener('click', () => {
  curretPreviewer += 1
  updateButtonsStatus(curretPreviewer)
  updatePreviewer(curretPreviewer)
})
