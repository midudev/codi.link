import * as monaco from 'monaco-editor' // to be changed

import cssFormatMonaco from 'css-format-monaco'

export const configurePrettierHotkeys = editors => {
  window.onresize = function () {
    editors.forEach(e => e.layout())
  }

  const alt = e =>
    navigator.userAgent.toLowerCase().includes('mac')
      ? e.metaKey
      : e.ctrlKey

  const generateCssFormater = () => cssFormatMonaco(
    monaco,
    // options
    // see full option list at https://github.com/beautify-web/js-beautify#css--html
    {
      indent_size: 2 // TODO: use the tab size from the config
    }
  )

  generateCssFormater()

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
