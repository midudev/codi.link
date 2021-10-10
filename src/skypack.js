import { eventBus, EVENTS } from './events-controller.js'
import debounce from './utils/debounce.js'
import { $ } from './utils/dom.js'
import escapeHTML from 'escape-html'

const API_URL = 'https://api.skypack.dev/v1'
const CDN_URL = 'https://cdn.skypack.dev'
const PACKAGE_VIEW_URL = 'https://www.skypack.dev/view'

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

  $searchResultsMessage.innerHTML = `${results.length} results for "${escapeHTML(searchTerm)}"`

  displayResults({ results, searchTerm })

  $searchResults.classList.remove('hidden')
}

async function fetchPackages (packageName) {
  const response = await window.fetch(`${API_URL}/search?q=${packageName}&p=1`)
  const { results } = await response.json()
  return results
}

function displayResults ({ results, searchTerm }) {
  results.forEach(result => {
    const $li = document.createElement('li')
    $li.title = result.description
    $li.innerHTML = getResultHTML({ result, searchTerm })

    $li.addEventListener('click', (e) => {
      if (e.target.className === 'skypack-open') return
      handlePackageSelected(result.name)
    })

    $searchResultsList.appendChild($li)
  })
}

function getResultHTML ({ result, searchTerm }) {
  const resultBadgesHTML = getResultBadgesHTML({ result, searchTerm })
  const updatedAt = Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(result.updatedAt))
  return `
    <header>
      <strong>${escapeHTML(result.name)}</strong>
      ${resultBadgesHTML}
    </header>
    <section class="skypack-description">${escapeHTML(result.description)}</section>
    <footer>
      <div class="skypack-updated" >Updated: ${updatedAt}</div>
      <a class="skypack-open" target="_blank" href="${PACKAGE_VIEW_URL}/${result.name}">details</a>
    </footer>`
}

function getResultBadgesHTML ({ result, searchTerm }) {
  const isPopular = result.popularityScore >= 0.8
  const popularHtml = isPopular ? '<div class="skypack-badge popular">popular</div>' : ''
  const typescriptHtml = result.hasTypes ? '<div class="skypack-badge typescript"></div>' : ''
  const deprecatedHtml = result.isDeprecated ? '<div class="skypack-badge deprecated">deprecated</div>' : ''
  const exactMatchHtml = result.name === searchTerm ? '<div class="skypack-badge exact-match">exact match</div>' : ''
  return `
    <div class="skypack-result-badges">
      ${typescriptHtml}
      ${popularHtml}
      ${deprecatedHtml}
      ${exactMatchHtml}
    </div>`
}

function handlePackageSelected (packageName) {
  let parsedName = packageName.split('/').join('-')
  if (parsedName.startsWith('@')) parsedName = parsedName.substr(1)
  eventBus.emit(EVENTS.ADD_SKYPACK_PACKAGE, { skypackPackage: parsedName, url: `${CDN_URL}/${packageName}` })
}
