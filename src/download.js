const getZip = () =>
  import('jszip').then(({ default: JSZip }) => new JSZip())

export async function downloadUserCode ({
  htmlContent,
  cssContent,
  jsContent,
  fileName = 'codi.link',
  zipInSingleFile = false
}) {
  const createZip = zipInSingleFile
    ? createZipWithSingleFile
    : createZipWithMultipleFiles

  const zip = await createZip({ htmlContent, cssContent, jsContent })
  return generateZip({ zip, fileName })
}

async function createZipWithSingleFile ({ htmlContent, cssContent, jsContent }) {
  const zip = await getZip()

  const indexHtml = `<!DOCTYPE html>
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

async function createZipWithMultipleFiles ({ htmlContent, cssContent, jsContent }) {
  const zip = await getZip()

  const indexHtml = `<!DOCTYPE html>
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
  return zip.generateAsync({ type: 'blob' }).then((blobData) => {
    const zipBlob = new window.Blob([blobData])
    const element = window.document.createElement('a')

    element.href = window.URL.createObjectURL(zipBlob)
    element.download = `${fileName}.zip`
    element.click()
  })
}
