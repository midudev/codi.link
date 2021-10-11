import { $ } from './dom'

const STATE_ICONS = {
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
  warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
  danger: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
}

const TRANSITION_DURATION = 400 // ms
const NOTIFICATION_DURATION = 3000 // ms
export default {
  /**
   * Display a notification
   * @param {Object} options - The options object
   * @param {string} options.type - Notification type: info, warning, danger
   * @param {string} options.message - Message to display
   * @param {string} options.position - Position of the notification: top-left, top-center top-right, bottom-left, bottom-center, bottom-right
   */
  show: ({ type, message, position = 'bottom-right' }) => {
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
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> 
            </div>
        `

    if (!$(`#notifications-wrapper.notification--${position}`)) {
      const wrapper = document.createElement('div')
      wrapper.setAttribute('id', 'notifications-wrapper')
      wrapper.classList.add(`notification--${position}`)
      notifications.appendChild(wrapper)
    }
    const notificationsWrapper = $(`#notifications-wrapper.notification--${position}`)

    notification.classList.add('bounce-active')

    // Accesibility attributes
    notification.setAttribute('role', 'alert')
    notification.setAttribute('aria-live', 'assertive')
    notification.setAttribute('aria-atomic', 'true')

    setTimeout(() => {
      notification.classList.remove('bounce-active')
    }, TRANSITION_DURATION)

    setTimeout(() => {
      notification.classList.add('bounce-leave')
    }, NOTIFICATION_DURATION - TRANSITION_DURATION / 2)
    // Remove notification after NOTIFICATION_DURATION
    setTimeout(() => {
      notification.remove()
    }, NOTIFICATION_DURATION)

    notification.querySelector('.icon-close').addEventListener('click', () => {
      notification.classList.add('bounce-leave')
      setTimeout(() => {
        notification.remove()
      }, TRANSITION_DURATION / 2)
    })

    if (position.match(/top-/)) {
      notificationsWrapper.insertAdjacentElement('afterbegin', notification)
    }
    if (position.match(/bottom-/)) {
      notificationsWrapper.insertAdjacentElement('beforeend', notification)
    }
  }
}
