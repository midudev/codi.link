export const configurePrettierHotkeys = editors => {
  window.onresize = function () {
    editors.forEach(e => e.layout())
  }

  const alt = e =>
    navigator.userAgent.toLowerCase().includes('mac')
      ? e.metaKey
      : e.ctrlKey

  const hotKeys = (e) => {
    editors.forEach(editor => {
      // Control/Command + P
      if (alt(e) && e.keyCode === 80) {
        e.preventDefault()
        editor.trigger('anyString', 'editor.action.quickCommand')
      }
    })
  }

  window.addEventListener('keydown', hotKeys)
}
