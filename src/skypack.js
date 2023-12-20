import { eventBus, EVENTS } from './events-controller.js'
import debounce from './utils/debounce.js'
import { $ } from './utils/dom.js'
import escapeHTML from 'escape-html'

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

  const {
    page: resultPage,
    hits: results,
    nbPages,
    nbHits: totalCount
  } = fetchResult
  currentPage = resultPage + 1
  totalPages = nbPages

  // microbenchmark: only displays total count at first time
  currentPage === 1 && displayTotalCount(totalCount)

  if (results.length === 0) return finishSearch()

  displayResults({ results, lastSearchInput })

  const $loadMoreResultsSentinel =
    $searchResultsList.querySelector('li:last-child')
  createLoadMoreResultsSentinelObserver($loadMoreResultsSentinel)
}

function displayTotalCount (totalCount) {
  const moreResultsSymbol = totalCount === 10_000 ? '+' : ''
  const formattedTotalCount =
    Intl.NumberFormat('es').format(totalCount) + moreResultsSymbol
  $searchResultsMessage.innerHTML = `${formattedTotalCount} results for "${escapeHTML(
    lastSearchInput
  )}"`
}

async function fetchNextPagePackagesAndDisplayResults () {
  const nextPage = currentPage + 1
  if (nextPage > totalPages) return finishSearch()

  await fetchPackagesAndDisplayResults({ page: nextPage })
}

async function fetchPackages ({ abortController, packageName, page = 1 }) {
  try {
    const resultFetch = await window.fetch(
      'https://ofcncog2cu-dsn.algolia.net/1/indexes/npm-search/query?x-algolia-agent=Algolia%20for%20JavaScript%20(3.35.1)%3B%20Browser%20(lite)&x-algolia-application-id=OFCNCOG2CU&x-algolia-api-key=f54e21fa3a2a0160595bb058179bfb1e',
      {
        headers: {
          accept: 'application/json',
          'accept-language': 'es-ES,es;q=0.6',
          'content-type': 'application/x-www-form-urlencoded',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'sec-gpc': '1'
        },
        referrer: 'https://www.jsdelivr.com/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: `{"params": "query=${packageName}&page=0&hitsPerPage=10&attributesToRetrieve=%5B%22deprecated%22%2C%22description%22%2C%22githubRepo%22%2C%22homepage%22%2C%22keywords%22%2C%22license%22%2C%22name%22%2C%22owner%22%2C%22version%22%2C%22popular%22%2C%22moduleTypes%22%2C%22styleTypes%22%2C%22jsDelivrHits%22%5D&analyticsTags=%5B%22jsdelivr%22%5D&facetFilters=moduleTypes%3Aesm"}`,
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        signal: abortController.signal
      }
    )

    const resultFetchJson = await resultFetch.json()
    return [null, resultFetchJson]
  } catch (error) {
    return [error, {}]
  }
}

function displayResults ({ results, searchTerm }) {
  results.forEach((result) => {
    // console.log(result)
    const $li = document.createElement('li')
    $li.title = result.description
    $li.innerHTML = getResultHTML({ result, searchTerm })
    $li.tabIndex = 0

    $li.addEventListener('click', async (e) => {
      const url = `https://cdn.jsdelivr.net/npm/${result.name}@${result.version}/+esm`

      if (e.target.className === 'skypack-open') {
        if (e.target.hasAttribute('data-copy')) {
          e.preventDefault()
          navigator.clipboard.writeText(url)
        }
        return
      }

      handlePackageSelected(result.name, url)
    })

    $li.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) handlePackageSelected(result.name)
    })

    $searchResultsList.appendChild($li)
  })
}

function getResultHTML ({ result, searchTerm }) {
  const resultBadgesHTML = getResultBadgesHTML({ result, searchTerm })

  return `
    <header>
      <strong>${escapeHTML(result.name)}</strong>
      ${resultBadgesHTML}
    </header>
    <section class="skypack-description">${escapeHTML(
      result.description
    )}</section>
    <footer>
      <div class="skypack-updated" >version: ${result.version}</div>
      <div>
        <a tabindex="-1" class="skypack-open" data-copy target="_blank" href="${CDN_URL}/${
    result.name
  }">copy</a>
        <a tabindex="-1" class="skypack-open" target="_blank" href="${PACKAGE_VIEW_URL}/${
    result.name
  }">details</a>
      </div>
    </footer>`
}

function getResultBadgesHTML ({ result, searchTerm }) {
  const isPopular = result.popularityScore >= 0.8
  const popularHtml = isPopular
    ? '<div class="skypack-badge popular">popular</div>'
    : ''
  const typescriptHtml = result.hasTypes
    ? '<div class="skypack-badge typescript"></div>'
    : ''
  const deprecatedHtml = result.isDeprecated
    ? '<div class="skypack-badge deprecated">deprecated</div>'
    : ''
  const exactMatchHtml =
    result.name === searchTerm
      ? '<div class="skypack-badge exact-match">exact match</div>'
      : ''
  return `
    <div class="skypack-result-badges">
      ${typescriptHtml}
      ${popularHtml}
      ${deprecatedHtml}
      ${exactMatchHtml}
    </div>`
}

function handlePackageSelected (packageName, packageUrl) {
  let parsedName = packageName.split('/').join('-')
  if (parsedName.startsWith('@')) parsedName = parsedName.substr(1)
  eventBus.emit(EVENTS.ADD_SKYPACK_PACKAGE, {
    skypackPackage: parsedName,
    url: packageUrl
  })
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

  const observer = new window.IntersectionObserver(
    handleIntersect,
    observerOptions
  )
  observer.observe($sentinelEl)
}

function showSpinner () {
  $spinner.removeAttribute('hidden')
}

function hideSpinner () {
  $spinner.setAttribute('hidden', '')
}
