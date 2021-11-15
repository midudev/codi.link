import { $ } from './utils/dom.js'

const setSideBar = (sideBarStyle) => {
  const sideBar = $('.aside-sections')

  if (sideBarStyle === 'compact') {
    sideBar.classList.add('aside-sections--compact')
  }

  if (sideBarStyle === 'default') {
    sideBar.classList.remove('aside-sections--compact')
  }
}

export default setSideBar
