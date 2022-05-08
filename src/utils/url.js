import { encode, decode } from 'js-base64'

const URL_DIVIDER = '|'

export const getCodesInUrl = () => {
  const { pathname } = window.location

  const [rawHtml, rawCss, rawJs] = decodeURIComponent(pathname).slice(1).split(URL_DIVIDER)

  return {
    html: rawHtml ? decode(rawHtml) : '',
    css: rawCss ? decode(rawCss) : '',
    javascript: rawJs ? decode(rawJs) : ''
  }
}

export const buildHashedCode = (html, css, js) =>
    `${encode(html)}${URL_DIVIDER}${encode(css)}${URL_DIVIDER}${encode(js)}`
