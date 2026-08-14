import { $ } from './dom'
import { ICONS } from '../icons.js'

const STATE_ICONS = {
  info: ICONS.infoCircle,
  warning: ICONS.alertTriangle,
  danger: ICONS.alertCircle
}

const TRANSITION_DURATION = 400 // ms
const NOTIFICATION_DURATION = 3000 // ms

export default {
  /**
   * Display a notification
   * @param {Object} options - The options object
   * @param {string} options.type - Notification type: info, warning, danger
   * @param {string} options.message - Message to display
   */
  show: ({ type, message }) => {
    const notifications = $('#notifications')
    const notification = document.createElement('div')

    notification.className = `notification notification--${type}`
    notification.innerHTML = `
    <div class="notification__icon">
      ${STATE_ICONS[type]}
    </div>
    <div class="notification__message">
      ${message}
    </div>
    <div class="icon-close">
      ${ICONS.x} 
    </div>
`

    let wrapper = $('#notifications-wrapper')

    if (!wrapper) {
      wrapper = document.createElement('div')
      wrapper.setAttribute('id', 'notifications-wrapper')
      notifications.appendChild(wrapper)
    }

    notification.classList.add('animation-in')

    // Accesibility attributes
    notification.setAttribute('role', 'alert')
    notification.setAttribute('aria-live', 'assertive')
    notification.setAttribute('aria-atomic', 'true')

    const timerIdOut = setTimeout(() => {
      notification.classList.remove('animation-in')
      notification.classList.add('animation-out')
    }, NOTIFICATION_DURATION - TRANSITION_DURATION / 2)

    // Remove notification after NOTIFICATION_DURATION
    const timerIdRemove = setTimeout(() => {
      notification.remove()
    }, NOTIFICATION_DURATION)

    const clearTimers = () => {
      clearTimeout(timerIdOut)
      clearTimeout(timerIdRemove)
    }

    notification.querySelector('.icon-close').addEventListener('click', () => {
      clearTimers()
      notification.classList.add('bounce-leave')
      setTimeout(() => {
        notification.remove()
      }, TRANSITION_DURATION / 2)
    })

    wrapper.insertAdjacentElement('beforeend', notification)
  }
}
