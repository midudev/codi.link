// @ts-check

import { generateConsoleScript } from '../console-script'

/**
 * Create an index.html content from provided data
 * @param {object} params - The parameters
 * @param {string} params.css - CSS
 * @param {string} params.html - HTML content
 * @param {string} params.js - JavaScript
 * @param {boolean} isEditor - Whether the code is being run in the editor or preview
 * @returns {string}
 */
export const createHtml = ({ css, html, js }, isEditor = false) => {
  const consoleScript = isEditor
    ? generateConsoleScript({ jsLineOffset: '__JS_LINE_OFFSET__' })
    : ''

  const jsOpen = !js
    ? ''
    : isEditor
      ? `<script type="module">
window.parent.postMessage({ preview: 'exec-start' }, '*')
</script>
    <script type="module">`
      : '<script type="module">'

  const jsClose = !js
    ? ''
    : isEditor
      ? `
//# sourceURL=javascript.js
    </script>
    <script type="module">
window.parent.postMessage({ preview: 'done' }, '*')
</script>`
      : `
    </script>`

  const beforeUserJs = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body { background: #fff; color: #111; }
    </style>
    <style id="preview-style">
      ${css}
    </style>
    ${consoleScript}
  </head>
  <body>
    ${html}
    ${jsOpen}`

  const jsLineOffset = beforeUserJs.split('\n').length

  return `${beforeUserJs}${js}${jsClose}
  </body>
</html>`.replaceAll('__JS_LINE_OFFSET__', String(jsLineOffset))
}
