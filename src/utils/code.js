import { encode } from 'js-base64'
import { saveCodeState } from '../services/code/code.service'
import { $ } from './dom'

export const updatePreview = async ({ html, css, js }) => {
  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`

  const id = window.location.pathname.replace('/', '')
  updateIframePreview({ html, css, js })

  const { id: codeId } = await saveCodeState({ code: hashedCode, currentId: id })

  window.history.replaceState(null, null, `/${codeId}`)
}

function createHtml ({ html, js, css }) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      ${css}
    </style>
  </head>
  <body>
    ${html}
    <script type="module">
    ${js}
    </script>
  </body>
</html>`
}

export const updateIframePreview = ({ html, js, css }) => {
  const htmlForPreview = createHtml({ html, js, css })
  $('iframe').setAttribute('srcdoc', htmlForPreview)
}
