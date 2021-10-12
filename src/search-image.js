import { eventBus, EVENTS } from './events-controller.js'
import debounce from './utils/debounce.js'
import { $ } from './utils/dom.js'
import escapeHTML from 'escape-html'
import Notification from './utils/notification.js'

const API_KEY = '23782118-dcfd21a7d4af0f4e1cf8e2e4f'
const BASE_URL = `https://pixabay.com/api/?key=${API_KEY}&per_page=25&q=`

const searchResults = $('#search-image .search-results')
const resultsList = searchResults.querySelector('.container-image-results')
const responseMessage = $('#search-image .search-results-message')
const imageSearch = $('#search-image input[type="search"]')

let lastSearchInput = ''

const handleSearch = async () => {
  const search = imageSearch.value.toLowerCase().trim()

  if (search === lastSearchInput) return
  lastSearchInput = search

  if (!search) {
    searchResults.classList.add('hidden')
    return
  }

  searchResults.classList.remove('hidden')
  resultsList.innerHTML = ''

  responseMessage.innerHTML = 'Searching...'

  const results = await fetchImage(search)

  responseMessage.innerHTML = `${results.hits.length} results for "${escapeHTML(search)}" 
  <a target="_blank" class="logo-pixabay" href="https://pixabay.com/">
    <img height="30px" src="https://pixabay.com/static/img/public/leaderboard_a.png" alt="Pixabay">
  </a>`

  showResults(results.hits)
}

const fetchImage = async (keyword) => {
  const fetchApi = await window.fetch(`${BASE_URL}${keyword}&image_type=photo`)
  const response = fetchApi.json()
  return response
}

const showResults = (results) => {
  results.forEach(result => {
    const img = document.createElement('img')
    img.title = result.tags
    img.src = result.previewURL

    img.addEventListener('click', () => {
      const image = `<img width="${result.webformatWidth}" height="${result.webformatHeight}" src="${result.largeImageURL}" />`
      handleImageSelected(image)
      Notification.show({ type: 'info', message: 'Image inserted' })
    })

    resultsList.appendChild(img)
  })
}

function handleImageSelected (image) {
  eventBus.emit(EVENTS.ADD_IMAGE_HTML, { image })
}

imageSearch.addEventListener('input', debounce(handleSearch, 200))
