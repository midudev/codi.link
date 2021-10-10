import { PROVIDERS } from './constants/authentication-providers.js'
import { authenticate } from './services/authentication/index.js'
import { $ } from './utils/dom.js'

const $navBar = $('#nav')
const $navBarRightSection = $('#nav-right-section')

$navBar.addEventListener('click', async () => {
  const { data } = await authenticate(PROVIDERS.GITHUB)
  if (!data) return undefined
  $navBarRightSection.innerHTML = `<div class="logged-user"><span>${data.user.reloadUserInfo.screenName}</span><img src="${data.user.photoURL}" alt="user-avatar"></div>`
})
