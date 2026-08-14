import { $ } from './utils/dom.js'
import { eventBus, EVENTS } from './events-controller.js'
import { DEMOS, loadDemo } from './demos/catalog.js'
import { getState } from './state.js'
import { translate } from './utils/translator.js'

const $demosList = $('#demos .demos-list')

let loadRequestId = 0

const createDemoCard = (demo) => {
  const $item = document.createElement('li')
  const $button = document.createElement('button')
  $button.type = 'button'
  $button.className = 'demo-card'
  $button.dataset.demoId = demo.id
  $button.setAttribute('aria-current', 'false')

  const $title = document.createElement('strong')
  $title.dataset.translate = demo.titleKey

  const $description = document.createElement('span')
  $description.className = 'demo-card-description'
  $description.dataset.translate = demo.descriptionKey

  $button.append($title, $description)
  $item.appendChild($button)
  return $item
}

const setActiveDemo = (id) => {
  $demosList.querySelectorAll('.demo-card').forEach(card => {
    const isActive = card.dataset.demoId === id
    card.classList.toggle('is-active', isActive)
    card.setAttribute('aria-current', String(isActive))
  })
}

const setCardLoading = (id, isLoading) => {
  const card = $demosList.querySelector(`[data-demo-id="${id}"]`)
  if (!card) return

  card.classList.toggle('is-loading', isLoading)
  card.setAttribute('aria-busy', String(isLoading))
  card.disabled = isLoading
}

const applyDemo = async (id) => {
  const requestId = ++loadRequestId

  setCardLoading(id, true)

  try {
    const code = await loadDemo(id)

    if (requestId !== loadRequestId) return

    eventBus.emit(EVENTS.LOAD_DEMO, code)
    setActiveDemo(id)
  } catch (error) {
    if (requestId !== loadRequestId) return

    console.error(error)
  } finally {
    setCardLoading(id, false)
  }
}

const renderDemos = () => {
  $demosList.replaceChildren(...DEMOS.map(createDemoCard))
}

$demosList.addEventListener('click', ({ target }) => {
  const card = target.closest('[data-demo-id]')
  if (!card || card.disabled) return

  applyDemo(card.dataset.demoId)
})

renderDemos()
translate(getState().language)
