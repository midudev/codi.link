import { getFullLocation } from './location-handler'

export const copyUrlToClipboard = (callback) => {
  const url = getFullLocation()

  navigator.clipboard.writeText(url)
    .then(callback)
}
