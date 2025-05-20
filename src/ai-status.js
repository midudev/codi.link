import { $ } from './utils/dom.js'
import { addStatusListener, getAIModelStatus } from './components/codi-editor/extensions/ai-autocomplete.js'
import { getState, subscribe } from './state.js'

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error'
}

// Get UI elements
const $aiStatusContainer = $('#ai-model-status')
let $aiStatusElement = $aiStatusContainer.querySelector('.ai-model-loading')

// Update UI based on model status
const updateStatusUI = (status) => {
  // Remove any existing status classes
  if ($aiStatusElement) {
    $aiStatusElement.remove()
  }

  // Create the appropriate status element
  $aiStatusElement = document.createElement('span')

  switch (status) {
    case STATUS.READY:
      $aiStatusElement.classList.add('ai-model-ready')
      $aiStatusElement.setAttribute('data-translate', 'aiModelReady')
      $aiStatusElement.textContent = 'AI code suggestions ready'
      break
    case STATUS.ERROR:
      $aiStatusElement.classList.add('ai-model-error')
      $aiStatusElement.textContent = 'Error loading AI model'
      break
    case STATUS.LOADING:
    default:
      $aiStatusElement.classList.add('ai-model-loading')
      $aiStatusElement.setAttribute('data-translate', 'aiModelLoading')
      $aiStatusElement.textContent = 'AI model is loading...'
      break
  }

  // Add to container
  $aiStatusContainer.appendChild($aiStatusElement)
}

// Check initial model status
updateStatusUI(getAIModelStatus())

// Subscribe to model status changes
addStatusListener(updateStatusUI)

// Subscribe to settings changes
subscribe((state) => {
  const { aiAutocomplete } = state
  $aiStatusContainer.style.display = aiAutocomplete ? 'block' : 'none'
})

// Initialize visibility based on current setting
const { aiAutocomplete } = getState()
$aiStatusContainer.style.display = aiAutocomplete ? 'block' : 'none'