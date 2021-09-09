import hotkeys from 'hotkeys-js'

hotkeys('ctrl+a,ctrl+b,r,f', function (event, handler) {
  switch (handler.key) {
    case 'ctrl+a': window.alert('you pressed ctrl+a!')
      break
    case 'ctrl+b': window.alert('you pressed ctrl+b!')
      break
    case 'r': window.alert('you pressed r!')
      break
    case 'f': window.alert('you pressed f!')
      break
    default: window.alert(event)
  }
})
