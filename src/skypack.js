import { EE, EVENTS } from './events-controller.js'
import debounce from './utils/debounce.js'
import { $ } from './utils/dom.js'
import escapeHTML from 'escape-html'

const API_URL = 'https://api.skypack.dev/v1'
const CDN_URL = 'https://cdn.skypack.dev'

const $searchResults = $('#skypack .search-results')
const $searchResultsList = $searchResults.querySelector('ul')
const $searchResultsMessage = $('#skypack .search-results-message')
const $skypackSearch = $('#skypack input[type="search"]')
$skypackSearch.addEventListener('input', debounce(handleSearch, 200))

let lastSearchInput = ''

async function handleSearch () {
  const $searchInput = $skypackSearch

  const searchTerm = $searchInput.value.toLowerCase().trim()

  if (searchTerm === lastSearchInput) return

  lastSearchInput = searchTerm

  if (!searchTerm) {
    $searchResults.classList.add('hidden')
    return
  }

  $searchResults.classList.remove('hidden')
  $searchResultsList.innerHTML = ''

  $searchResultsMessage.innerHTML = 'Searching...'

  const results = await fetchPackages(searchTerm)

  results.forEach(result => {
    const $li = document.createElement('li')
    $li.title = result.description

    $li.innerHTML = `
        <strong>${escapeHTML(result.name)}</strong>
        <small>${escapeHTML(result.description)}</small>
    `

    $li.addEventListener('click', () => handlePackageSelected(result.name))

    $searchResultsList.appendChild($li)
  })

  $searchResultsMessage.innerHTML = `${results.length} results for "${escapeHTML(searchTerm)}"`

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

  EE.emit(EVENTS.ADD_SKYPACK_PACKAGE, { skypackPackage: parsedName, url: `${CDN_URL}/${packageName}` })
}
