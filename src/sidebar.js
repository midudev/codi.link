/**
 * Change the sidebar style to compact or default
 * @param {'compact' | 'default'} sideBarStyle
 */
export const setSidebar = sideBarStyle => {
  const rootElement = document.documentElement
  rootElement.classList.toggle(
    'sections-compact',
    sideBarStyle === 'compact'
  )
}
