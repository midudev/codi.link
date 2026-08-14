import { encode } from 'js-base64'

export function getCleanPath () {
  return '/'
}

export function getEncodedPath ({ html = '', css = '', js = '' }) {
  return `/${encode(html)}%7C${encode(css)}%7C${encode(js)}`
}

export function getEncodedString ({ html = '', css = '', js = '' }) {
  return `${encode(html)}|${encode(css)}|${encode(js)}`
}
