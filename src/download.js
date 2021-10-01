import JSZip from 'jszip'

export function downloadUserCode ({
  htmlContent,
  cssContent,
  jsContent,
  fileName = 'codi.link',
  zipInSingleFile = false
}) {
  const createZip = zipInSingleFile ? createZipWithSingleFile : createZipWithMultipleFiles

  const zip = createZip({ htmlContent, cssContent, jsContent })
  generateZip({ zip, fileName })
}

function createZipWithSingleFile ({ htmlContent, cssContent, jsContent }) {
  const zip = new JSZip()

  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      ${cssContent}
    </style>
  </head>
  <body>
    ${htmlContent}
    <script type="module">
    ${jsContent}
    </script>
  </body>
</html>`

  zip.file('index.html', indexHtml)

  return zip
}

function createZipWithMultipleFiles ({ htmlContent, cssContent, jsContent }) {
  const zip = new JSZip()

  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <link type="text/css" rel="stylesheet" href="css/style.css"/>
  </head>
  <body>
    ${htmlContent}
    <script type="module" src="js/script.js"></script>
  </body>
</html>`

  zip.file('css/style.css', cssContent)
  zip.file('js/script.js', jsContent)
  zip.file('index.html', indexHtml)

  return zip
}

function generateZip ({ zip, fileName }) {
  zip.generateAsync({ type: 'blob' }).then((blobData) => {
    const zipBlob = new window.Blob([blobData])
    const element = window.document.createElement('a')

    element.href = window.URL.createObjectURL(zipBlob)
    element.download = `${fileName}.zip`
    element.click()
  })
}
