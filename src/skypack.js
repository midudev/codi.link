import debounce from './utils/debounce.js'
import { $ } from './utils/dom.js'

const API_URL = 'https://api.skypack.dev/v1'
const CDN_URL = 'https://cdn.skypack.dev'

const $searchResults = $('#skypack .search-results')
const $searchResultsList = $searchResults.querySelector('ul')
const $searchResultsMessage = $('#skypack .search-results-message')
const $skypackSearch = $('#skypack input[type="search"]')
$skypackSearch.addEventListener('input', debounce(handleSearch, 200))

async function handleSearch () {
  const $searchInput = $skypackSearch

  $searchResults.classList.remove('hidden')
  $searchResultsList.innerHTML = ''

  let results = []

  const searchTerm = $searchInput.value.toLowerCase()

  if (searchTerm === '' || searchTerm.trim() === '') {
    $searchResults.classList.add('hidden')
    return
  }

  $searchResultsMessage.innerHTML = 'Searching...'

  results = await fetchPackages(searchTerm)

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const $li = document.createElement('li')
    $li.title = result.description

    $li.innerHTML = `
        <strong>${result.name}</strong>
        <small>${result.description}</small>
    `

    $li.addEventListener('click', () => handlePackageSelected(result.name))

    $searchResultsList.appendChild($li)
  }

  $searchResultsMessage.innerHTML = `${results.length} results for "${searchTerm}"`

  $searchResults.classList.remove('hidden')
}

async function fetchPackages (packageName) {
  const response = await window.fetch(`${API_URL}/search?q=${packageName}&p=1`)
  const { results } = await response.json()
  return results.map(({ name, description }) => ({ name, description }))
}

function handlePackageSelected (packageName) {
  let parsedName = packageName.split('/').join('-')
  if (parsedName.startsWith('@')) parsedName = parsedName.substr(1)
  window.postMessage({ package: parsedName, url: `${CDN_URL}/${packageName}` })
}
