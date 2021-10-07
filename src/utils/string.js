export const capitalize = (str) => {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

export const copyToClipboard = (str) => {
  navigator.clipboard.writeText(str).then(() => {
    window.alert('El enlace se ha copiado en el portapapeles')
  })
}
