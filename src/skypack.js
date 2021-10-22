import { eventBus, EVENTS } from './events-controller.js'
import debounce from './utils/debounce.js'
import { $ } from './utils/dom.js'
import escapeHTML from 'escape-html'

const API_URL = 'https://api.skypack.dev/v1'
const CDN_URL = 'https://cdn.skypack.dev'
const PACKAGE_VIEW_URL = 'https://www.skypack.dev/view'

const $asideBar = $('.aside-bar')
const $searchResults = $('#skypack .search-results')
const $searchResultsList = $searchResults.querySelector('ul')
const $searchResultsMessage = $('#skypack .search-results-message')
const $skypackSearch = $('#skypack input[type="search"]')
const $spinner = $searchResults.querySelector('.spinner')

$skypackSearch.addEventListener('input', debounce(handleSearchInput, 200))

let lastSearchInput = ''
let currentPage = 1
let totalPages = 1
let lastFetchAbortController

async function handleSearchInput () {
  const $searchInput = $skypackSearch

  const searchTerm = $searchInput.value.toLowerCase().trim()

  if (searchTerm === lastSearchInput) return

  lastSearchInput = searchTerm

  if (!searchTerm) return clearSearch()

  await startSearch()
}

function clearSearch () {
  lastFetchAbortController?.abort()
  hideSpinner()
  $searchResultsMessage.innerHTML = ''
  $searchResults.classList.add('hidden')
}

async function startSearch () {
  $searchResults.classList.remove('hidden')
  $searchResultsList.innerHTML = ''

  $searchResultsMessage.innerHTML = 'Searching...'

  showSpinner()
  await fetchPackagesAndDisplayResults({ page: 1 })

  $searchResults.classList.remove('hidden')
}

function finishSearch () {
  hideSpinner()
}

async function fetchPackagesAndDisplayResults ({ page = 1 }) {
  lastFetchAbortController?.abort()
  lastFetchAbortController = new window.AbortController()

  const [error, fetchResult] = await fetchPackages({
    page,
    abortController: lastFetchAbortController,
    packageName: lastSearchInput
  })

  // the last aborted fetch enters here
  if (error) return

  const { results, meta } = fetchResult
  currentPage = meta.page
  totalPages = meta.totalPages

  // microbenchmark: only displays total count at first time
  currentPage === 1 && displayTotalCount(meta.totalCount)

  if (results.length === 0) return finishSearch()

  displayResults({ results, lastSearchInput })

  const $loadMoreResultsSentinel = $searchResultsList.querySelector('li:last-child')
  createLoadMoreResultsSentinelObserver($loadMoreResultsSentinel)
}

function displayTotalCount (totalCount) {
  const moreResultsSymbol = (totalCount === 10_000 ? '+' : '')
  const formattedTotalCount = Intl.NumberFormat('es').format(totalCount) + moreResultsSymbol
  $searchResultsMessage.innerHTML = `${formattedTotalCount} results for "${escapeHTML(lastSearchInput)}"`
}

async function fetchNextPagePackagesAndDisplayResults () {
  const nextPage = currentPage + 1
  if (nextPage > totalPages) return finishSearch()

  await fetchPackagesAndDisplayResults({ page: nextPage })
}

async function fetchPackages ({ abortController, packageName, page = 1 }) {
  const fetchUrl = `${API_URL}/search?q=${packageName}&p=${page}`
  const fetchOptions = { signal: abortController.signal }
  try {
    const resultFetch = await window.fetch(fetchUrl, fetchOptions)
    const resultFetchJson = await resultFetch.json()
    return [null, resultFetchJson]
  } catch (error) {
    return [error, {}]
  }
}

function displayResults ({ results, searchTerm }) {
  results.forEach(result => {
    const $li = document.createElement('li')
    $li.title = result.description
    $li.innerHTML = getResultHTML({ result, searchTerm })
    $li.tabIndex = 0

    $li.addEventListener('click', (e) => {
      if (e.target.className === 'skypack-open') return
      handlePackageSelected(result.name)
    })
    $li.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) handlePackageSelected(result.name)
    })

    $searchResultsList.appendChild($li)
  })
}

function getResultHTML ({ result, searchTerm }) {
  const resultBadgesHTML = getResultBadgesHTML({ result, searchTerm })
  const updatedAt = Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(result.updatedAt))
  return `
    <header>
      <strong>${escapeHTML(result.name)}</strong>
      ${resultBadgesHTML}
    </header>
    <section class="skypack-description">${escapeHTML(result.description)}</section>
    <footer>
      <div class="skypack-updated" >Updated: ${updatedAt}</div>
      <a tabindex="-1" class="skypack-open" target="_blank" href="${PACKAGE_VIEW_URL}/${result.name}">details</a>
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

function createLoadMoreResultsSentinelObserver ($sentinelEl) {
  const handleIntersect = async (entries, observer) => {
    const [entry] = entries
    if (!entry.isIntersecting) return

    observer.disconnect()
    await fetchNextPagePackagesAndDisplayResults()
  }

  const observerOptions = {
    root: $asideBar,
    rootMargin: '100%'
  }

  const observer = new window.IntersectionObserver(handleIntersect, observerOptions)
  observer.observe($sentinelEl)
}

function showSpinner () {
  $spinner.removeAttribute('hidden')
}

function hideSpinner () {
  $spinner.setAttribute('hidden', '')
}
