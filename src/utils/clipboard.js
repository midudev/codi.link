export const copyToClipboard = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => console.log('copy success'))
    .catch((error) => console.error(error))
}
