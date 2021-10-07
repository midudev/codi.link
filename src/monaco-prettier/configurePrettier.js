import * as monaco from 'monaco-editor' // to be changed

import cssFormatMonaco from 'css-format-monaco'

export const configurePrettierHotkeys = editors => {
  window.onresize = function () {
    editors.forEach(e => e.layout())
  }

  const alt = (e) => (navigator.userAgent.includes('mac') ? e.metaKey : e.ctrlKey)
  const generateCssFormater = () => cssFormatMonaco(
    monaco,
    // options
    // see full option list at https://github.com/beautify-web/js-beautify#css--html
    {
      tab_size: 2
    }
  )

  generateCssFormater()

  const hotKeys = (e) => {
    editors.forEach(editor => {
      // ctrl/cmd + shift + f
      if (alt(e) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        editor.getAction('editor.action.formatDocument').run()
      }
      // ctrl/cmd + p
      if (alt(e) && e.keyCode === 80) {
        e.preventDefault()
        editor.trigger('anyString', 'editor.action.quickCommand')
      }
    })
  }

  window.addEventListener('keydown', hotKeys)
}
