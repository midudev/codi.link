import { $ } from './utils/dom.js'
import Notification from './utils/notification.js'

export async function copyToClipboard ({ text }) {
  console.log(text)
  await navigator.clipboard
    .writeText(text)
    .then(() => Notification.show({ type: 'info', message: 'Copied 👌' }))
    .catch(() => Notification.show({ type: 'danger', message: 'Try again❌' }))
}

export const $buttonCopyHtml = $('#button-copy-html')
export const $buttonCopyCSS = $('#button-copy-css')
export const $buttonCopyJS = $('#button-copy-js')
