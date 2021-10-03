import { $ } from './utils/dom.js'

const $input = $('.share-url-input')
const $icon = $('.share-input-icon')
const $messageIcon = $('.copy-icon-message')

$icon.addEventListener('click', () => handleCopyToClipboard())

function handleCopyToClipboard () {
  const textToCopy = $input.value
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      $messageIcon.removeAttribute('hidden')
      setTimeout(() => {
        $messageIcon.setAttribute('hidden', '')
      }, 1000)
    })
    .catch(error => { console.log(error) })
}
