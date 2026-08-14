export function getEditorValues (editors) {
  return {
    html: editors.html.getValue(),
    css: editors.css.getValue(),
    js: editors.javascript.getValue()
  }
}

export function isEmptyCode ({ html = '', css = '', js = '' }) {
  const isBlank = (value) => !value.replace(/\n/g, '').trim()
  return isBlank(html) && isBlank(css) && isBlank(js)
}
