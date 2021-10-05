import LZString from 'lz-string'

const { pathname } = window.location

export const decodeURL = () => pathname === '/' ? '' : LZString.decompressFromBase64(pathname.slice(1))

export const encodeURL = ({ html, js, css }) => LZString.compressToBase64(`${html}|${css}|${js}`)
