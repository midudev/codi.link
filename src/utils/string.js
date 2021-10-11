export const capitalize = (str) => {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

/**
 * Search for a string line in a string
 * @param {string} str Search text
 * @param {string} input Where to search
 * @param {number} lines In how many lines do we want to search
 * @returns {string} Line finded
 */
export const searchByLine = (str, input, lines = 10) => {
  const linesArr = str.split('\n')
  const parsedInput = input.endsWith(';') ? input.slice(0, -1) : input
  return linesArr.slice(0, lines).find((line) => line.includes(parsedInput))
}

export const copyToClipboard = (str) => {
  navigator.clipboard.writeText(str).then(() => {
    window.alert('El enlace se ha copiado en el portapapeles')
  })
}
