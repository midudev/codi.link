import { $ } from '../utils/dom'

const buttonDownloadHTML = $('#html .icon-editor')
const buttonDownloadCSS = $('#css .icon-editor')
const buttonDownloadJS = $('#js .icon-editor')

const downloadCodeDocument = $('#button-download')

const editorCode = (element) => {
  return $(element).innerText.replace(/\s/g, ' ')
}

const buttonDownload = (button, editorRef, documentType, nameDocument) => {
  button.addEventListener('click', () => {
    const document = new window.Blob([$(editorRef).innerText], { type: documentType })
    const urlFile = URL.createObjectURL(document)

    button.href = urlFile
    button.download = nameDocument
  })
}

buttonDownload(buttonDownloadHTML, '#html', 'text/html', 'code-html.html')
buttonDownload(buttonDownloadCSS, '#css', 'text/stylesheet', 'code-css.css')
buttonDownload(buttonDownloadJS, '#js', 'text/javascript', 'code-js.js')

downloadCodeDocument.addEventListener('click', () => {
  const templateCode = `
  <!DOCTYPE html>
    <html lang="en">
    <head>
        <style>
        ${editorCode('#css')}
        </style>
    </head>
    <body>
        ${editorCode('#html')}
        <script type="module">
        ${editorCode('#js')}
        </script>
    </body>
    </html>`

  const fileContent = new window.Blob([templateCode], { type: 'text/plain' })
  const urlFile = URL.createObjectURL(fileContent)

  downloadCodeDocument.href = urlFile
  downloadCodeDocument.download = 'index.html'
})
