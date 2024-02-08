import { createHtml } from './utils/createHtml.js'

const getZip = () =>
  import('client-zip').then(({ downloadZip }) => downloadZip)

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

  const zipBlob = await createZip({ htmlContent, cssContent, jsContent })
  return generateZip({ zipBlob, zipFileName })
}

async function createZipWithSingleFile ({ htmlContent, cssContent, jsContent }) {
  const zip = await getZip()
  const indexHTML = createHtml({ css: cssContent, html: htmlContent, js: jsContent })
  return await zip({ name: 'index.html', input: indexHTML }).blob()
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

  return await zip([
    { name: 'style.css', input: cssContent },
    { name: 'script.js', input: jsContent },
    { name: 'index.html', input: indexHtml }
  ]).blob()
}

function generateZip ({ zipBlob, zipFileName }) {
  console.log({ zipBlob, zipFileName })
  const element = window.document.createElement('a')
  element.href = window.URL.createObjectURL(zipBlob)
  element.download = `${zipFileName}.zip`
  element.click()
  element.remove()
}
