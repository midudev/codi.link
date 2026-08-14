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

  const indexHtml = buildIndexHtml(htmlContent)

  return await zip([
    { name: 'style.css', input: cssContent },
    { name: 'script.js', input: jsContent },
    { name: 'index.html', input: indexHtml }
  ]).blob()
}

function buildIndexHtml (html) {
  const hasDoctype = /<!doctype\s+html[^>]*>/i.test(html)
  const hasHtml = /<html[\s>]/i.test(html)
  const hasHead = /<head[\s>]/i.test(html)
  const hasBody = /<body[\s>]/i.test(html)
  const hasStyleLink = /<link[^>]*href=["']style\.css["'][^>]*>/i.test(html)
  const hasScript = /<script[^>]*src=["']script\.js["'][^>]*>/i.test(html)

  let result = html

  // Add script before </body> or at the end
  if (!hasScript) {
    if (hasBody) {
      result = result.replace(/<\/body>/i, '    <script type="module" src="script.js"></script>\n  </body>')
    } else {
      result = result + '\n    <script type="module" src="script.js"></script>'
    }
  }

  // Add stylesheet link inside <head> or store for later
  if (!hasStyleLink) {
    if (hasHead) {
      result = result.replace(/<head([^>]*)>/i, '<head$1>\n    <link type="text/css" rel="stylesheet" href="style.css"/>')
    }
    // If no <head>, it will be added below with the link included
  }

  // Add <head> if missing
  if (!hasHead) {
    const headBlock = '  <head>\n    <link type="text/css" rel="stylesheet" href="style.css"/>\n  </head>'
    if (hasBody) {
      result = result.replace(/<body/i, headBlock + '\n  <body')
    } else if (hasHtml) {
      result = result.replace(/<html([^>]*)>/i, '<html$1>\n' + headBlock)
    } else {
      result = headBlock + '\n' + result
    }
  }

  // Wrap in <body> if missing
  if (!hasBody) {
    if (hasHtml) {
      // Find content after </head> and before </html>, wrap it in <body>
      result = result.replace(/(<\/head>)([\s\S]*?)(<\/html>)/i, '$1\n  <body>\n    $2\n  </body>\n$3')
    } else {
      // Find content after </head> and wrap the rest in <body>
      const headEnd = result.indexOf('</head>')
      if (headEnd !== -1) {
        const afterHead = headEnd + '</head>'.length
        const before = result.slice(0, afterHead)
        const after = result.slice(afterHead)
        result = before + '\n  <body>' + after + '\n  </body>'
      } else {
        result = '  <body>\n' + result + '\n  </body>'
      }
    }
  }

  // Wrap in <html> if missing
  if (!hasHtml) {
    result = '<html lang="en">\n' + result + '\n</html>'
  }

  // Add DOCTYPE if missing
  if (!hasDoctype) {
    result = '<!DOCTYPE html>\n' + result
  }

  return result
}

function generateZip ({ zipBlob, zipFileName }) {
  const element = window.document.createElement('a')
  const objectUrl = window.URL.createObjectURL(zipBlob)
  element.href = objectUrl
  element.download = `${zipFileName}.zip`
  element.click()
  element.remove()
  window.URL.revokeObjectURL(objectUrl)
}
