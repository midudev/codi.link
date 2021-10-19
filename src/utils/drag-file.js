import { $ } from './dom'
import { eventBus, EVENTS } from '../events-controller'

$('#drag-file').addEventListener('drop', (e) => {
  readmultifiles(e)
  $('.zone-drag-drop').classList.remove('enter')
})
$('.zone-drag-drop').addEventListener('dragleave', (e) => {
  console.log(e)
  $('.zone-drag-drop').classList.remove('enter')
})
$('.zone-drag-drop').addEventListener('dragenter', (e) => {
  console.log(e)
  $('.zone-drag-drop').classList.add('enter')
})

function readmultifiles (e) {
  const files = e.dataTransfer.files
  Object.keys(files).forEach(i => {
    const file = files[i]
    const typeFile = files[i].type
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
