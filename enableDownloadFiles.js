import JSZip from 'jszip'
const $ = selector => document.querySelector(selector)

function createCodeFile (content, name, extension) {
  return new window.File([content], `${name}.${extension}`, { type: extension })
}

function getZip (files) {
  const zip = new JSZip()

  for (const file of files) {
    const filename = file.name
    zip.file(filename, file)
  }

  return zip
}

function downloadZip (zip) {
  zip.generateAsync({ type: 'blob' }).then((blobdata) => {
    const zipblob = new window.Blob([blobdata])
    const elem = window.document.createElement('a')

    elem.href = window.URL.createObjectURL(zipblob)
    elem.download = 'codi-link.zip'
    elem.click()
  })
}

function enableDownloadFiles (...selectors) {
  window.onload = function () {
    const downloadButton = document.createElement('button')
    downloadButton.setAttribute('id', 'download')
    $('#app').appendChild(downloadButton)

    $('#download').addEventListener('click', function () {
      const files = selectors.map(selector => {
        const content = $(selector).innerText
        const extension = selector.split('#')[1]

        return createCodeFile(content, extension, extension)
      })

      const zip = getZip(files)
      downloadZip(zip)
    })
  }
}

export default enableDownloadFiles
