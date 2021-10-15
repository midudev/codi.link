import Notification from './notification'

export const copyToClipboard = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => Notification.show({ type: 'info', message: 'Code copied successfully!' }))
    .catch((error) => Notification.show({ type: 'error', message: error }))
}
