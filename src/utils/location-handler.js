export const PARTS_SEPARATOR = '|'
export const PARTS_SEPARATOR_ENCODED = encodeURIComponent(PARTS_SEPARATOR)

export const getRawPartsFromLocation = (separator = PARTS_SEPARATOR_ENCODED) => {
  const { pathname } = window.location
  return pathname.slice(1).split(separator)
}

export const getFullLocation = () => {
  const { origin } = window.location
  const [rawHtml, rawCss, rawJs] = getRawPartsFromLocation(PARTS_SEPARATOR)
  return `${origin}/${rawHtml}${PARTS_SEPARATOR_ENCODED}${rawCss}${PARTS_SEPARATOR_ENCODED}${rawJs}`
}
