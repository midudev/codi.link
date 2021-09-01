const $ = selector => document.querySelector(selector)

function enableDownloadFiles (...selectors) {
  window.onload = function () {
    const downloadButton = document.createElement('button')
    downloadButton.setAttribute('id', 'download')
    $('#app').appendChild(downloadButton)

    $('#download').addEventListener('click', function () {
      for (const selector of selectors) {
        const content = $(selector).innerText
        console.log(content)
      }
    })
  }
}

export default enableDownloadFiles
