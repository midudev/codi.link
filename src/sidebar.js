/**
 * Change the sidebar style to compact or default
 * @param {'compact' | 'default'} sideBarStyle
 */
const setSideBar = sideBarStyle => {
  const rootElement = document.documentElement
  rootElement.classList.toggle('sections-compact', sideBarStyle === 'compact')
}

export default setSideBar
