export const MOBILE_LAYOUT_QUERY = '(max-width: 650px)'

export function getLayoutType (layout) {
  if (typeof layout === 'string' && layout) return layout
  if (layout && typeof layout === 'object' && layout.type) return layout.type
  return 'default'
}

export function isNestedLayout (layout) {
  const type = getLayoutType(layout)
  return type === 'default' || type === 'layout-2'
}

export function isMobileLayout () {
  return window.matchMedia(MOBILE_LAYOUT_QUERY).matches
}

export function resolveLayoutType (layout) {
  if (isMobileLayout()) return 'tabs'
  return getLayoutType(layout)
}
