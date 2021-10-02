export const getSessionId = () => {
  const urlMatch = window.location.search.match(/\?join=([\w-]*)/)
  return urlMatch ? urlMatch[1] : null
}
