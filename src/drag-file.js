import { $ } from './utils/dom'
import { eventBus, EVENTS } from './events-controller'

const $inputFileDrop = $('#input-file-drop')
const $overlayDrag = $('.overlay-drag')
const $dragAndDropZone = $('.zone-drag-drop')

$inputFileDrop.addEventListener('drop', (e) => {
  readFiles(e)
  $overlayDrag.classList.add('hidden')
})

$inputFileDrop.addEventListener('dragenter', () => {
  $dragAndDropZone.classList.add('focus')
})

$inputFileDrop.addEventListener('dragleave', () => {
  $dragAndDropZone.classList.remove('focus')
})

window.addEventListener('dragenter', (e) => {
  if (e.clientY >= 0 || e.clientX >= 0) {
    $overlayDrag.classList.remove('hidden')
  }
})

window.addEventListener('dragleave', ({ clientX, clientY }) => {
  if (clientY <= 0 || clientX <= 0 ||
    (clientX >= window.innerWidth || clientY >= window.innerHeight)) {
    $overlayDrag.classList.add('hidden')
  }
})

window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    $overlayDrag.classList.add('hidden')
  }
})

function readFiles (e) {
  const { files } = e.dataTransfer
  Object.values(files).forEach(file => {
    const { type: typeFile } = file
    const reader = new window.FileReader()
    reader.onload = ({ target }) => {
      printContent(target.result, typeFile)
    }
    reader.readAsBinaryString(file)
  })
}

function printContent (content, typeFile) {
  eventBus.emit(EVENTS.DRAG_FILE, { content, typeFile })
}
