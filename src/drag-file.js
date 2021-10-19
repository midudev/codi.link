import { $ } from './utils/dom'
import { eventBus, EVENTS } from './events-controller'

$('#input-file-drop').addEventListener('drop', (e) => {
  readFiles(e)
  $('.zone-drag-drop').classList.remove('focus')
})

$('#input-file-drop').addEventListener('dragenter', () => {
  $('.zone-drag-drop').classList.add('focus')
})

$('#input-file-drop').addEventListener('dragleave', () => {
  $('.zone-drag-drop').classList.remove('focus')
})

function readFiles (e) {
  const files = e.dataTransfer.files
  Object.values(files).forEach(file => {
    const typeFile = file.type
    const reader = new window.FileReader()
    reader.onload = (e) => {
      printContent(e.target.result, typeFile)
    }
    reader.readAsBinaryString(file)
  })
}

function printContent (content, typeFile) {
  eventBus.emit(EVENTS.DRAG_FILE, { content, typeFile })
}
