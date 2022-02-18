import { $ } from './utils/dom.js'

const sideBar = $('.aside-sections')

/**
 * Change the sidebar style to compact or default
 * @param {'compact' | 'default'} sideBarStyle
 */
const setSideBar = (sideBarStyle) => {
  sideBar.classList.toggle('aside-sections--compact', sideBarStyle === 'compact')
}

export default setSideBar
