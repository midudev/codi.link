export const getSessionId = () => {
  const urlMatch = window.location.search.match(/\?join=([\w-]*)/)
  return urlMatch ? urlMatch[1] : null
}

export const removeIdFromUrl = () => {
  window.history.replaceState(null, null, window.location.pathname)
}
