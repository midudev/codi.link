import { PROVIDERS } from './constants/authentication-providers.js'
import { authenticate } from './services/authentication/index.js'
import { getState } from './state.js'
import { $ } from './utils/dom.js'

const $navBar = $('#nav')
const $navBarRightSection = $('#nav-right-section')
const { updateSettings, ...settings } = getState()
const { user } = settings

const setLoggedUserUI = () => {
  $navBarRightSection.innerHTML = `<div class="logged-user"><span>${user.reloadUserInfo.screenName}</span><img src="${user.photoURL}" alt="user-avatar"></div>`
}

if (user.token) setLoggedUserUI()

if (!user.token) {
  $navBar.addEventListener('click', async () => {
    const { data } = await authenticate(PROVIDERS.GITHUB)
    if (!data) return undefined
    setLoggedUserUI()

    const { token, user } = data

    updateSettings({
      key: 'user',
      value: {
        token,
        ...user
      }
    })
  })
}
