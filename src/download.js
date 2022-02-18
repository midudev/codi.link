import { createHtml } from './utils/createHtml.js'

const getZip = () =>
  import('jszip').then(({ default: JSZip }) => new JSZip())

const DEFAULT_ZIP_FILE_NAME = 'codi.link'

export async function downloadUserCode ({
  htmlContent,
  cssContent,
  jsContent,
  zipFileName = DEFAULT_ZIP_FILE_NAME,
  zipInSingleFile = false
}) {
  zipFileName = zipFileName === '' ? DEFAULT_ZIP_FILE_NAME : zipFileName

  const createZip = zipInSingleFile
    ? createZipWithSingleFile
    : createZipWithMultipleFiles

  const zip = await createZip({ htmlContent, cssContent, jsContent })
  return generateZip({ zip, zipFileName })
}

async function createZipWithSingleFile ({ htmlContent, cssContent, jsContent }) {
  const zip = await getZip()
  const indexHTML = createHtml({ css: cssContent, html: htmlContent, js: jsContent })

  zip.file('index.html', indexHTML)

  return zip
}

async function createZipWithMultipleFiles ({ htmlContent, cssContent, jsContent }) {
  const zip = await getZip()

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <link type="text/css" rel="stylesheet" href="style.css"/>
  </head>
  <body>
    ${htmlContent}
    <script type="module" src="script.js"></script>
  </body>
</html>`

  zip.file('style.css', cssContent)
  zip.file('script.js', jsContent)
  zip.file('index.html', indexHtml)

  return zip
}

function generateZip ({ zip, zipFileName }) {
  return zip.generateAsync({ type: 'blob' }).then((blobData) => {
    const zipBlob = new window.Blob([blobData])
    const element = window.document.createElement('a')

    element.href = window.URL.createObjectURL(zipBlob)
    element.download = `${zipFileName}.zip`
    element.click()
  })
}
