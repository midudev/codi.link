import { $ } from './utils/dom.js'
import { EVENTS, eventBus } from './events-controller.js'
import { getHistoryState } from './history-store.js'
import { ICONS } from './icons.js'

export { getHistoryState, setHistoryState, subscribeHistory } from './history-store.js'

const $historyList = $('#history .history-list')

const HISTORY_ICONS = {
  remove: ICONS.trash,
  edit: ICONS.pencil
}

const { updateHistoryItemName, removeHistoryItem } = getHistoryState()

const removeButton = ({ id, name, isActive }) => {
  const $removeButton = document.createElement('button')
  $removeButton.innerHTML = HISTORY_ICONS.remove
  $removeButton.ariaLabel = `Remove ${name}`

  $removeButton.addEventListener('click', (e) => {
    e.preventDefault()

    removeHistoryItem({ id })
    if (isActive) {
      eventBus.emit(EVENTS.OPEN_NEW_INSTANCE)
    }
  })

  return $removeButton
}

const editButton = ({ id, name }) => {
  const $editButton = document.createElement('button')
  $editButton.innerHTML = HISTORY_ICONS.edit
  $editButton.ariaLabel = `Edit ${name}`

  $editButton.addEventListener('click', (e) => {
    e.preventDefault()

    const $button = $historyList.querySelector(`#history-item-${id} button`)
    const $input = document.createElement('input')
    $input.value = $button.textContent
    $button.replaceWith($input)
    $input.focus()
    $input.select()

    const updateName = () => {
      const value = $input.value
      $button.textContent = value
      updateHistoryItemName({ id, prevName: name, newName: value })
      $input.replaceWith($button)
    }

    $input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        $input.blur()
      }
    })
    $input.addEventListener('blur', () => updateName())
  })

  return $editButton
}

const openItemButton = ({ id, name }) => {
  const $button = document.createElement('button')
  $button.textContent = name
  $button.ariaLabel = `Open ${name}`

  $button.addEventListener('click', (e) => {
    e.preventDefault()
    const item = getHistoryState().history.items.find(historyItem => historyItem.id === id)
    if (!item) return

    eventBus.emit(EVENTS.OPEN_EXISTING_INSTANCE, { value: item.value, id })
  })

  return $button
}

const createListItem = ({ id, name, isActive }) => {
  const $li = document.createElement('li')
  $li.id = `history-item-${id}`

  if (isActive) {
    $li.classList.add('is-active')
  }

  const $openButton = openItemButton({ id, name })
  const $removeButton = removeButton({ id, name, isActive })
  const $editButton = editButton({ id, name })
  const $actions = document.createElement('div')

  $actions.classList.add('actions')
  $actions.appendChild($editButton)
  $actions.appendChild($removeButton)

  $li.appendChild($openButton)
  $li.appendChild($actions)

  return $li
}

const getRelativeDateLabel = (timestamp) => {
  const differenceInDays = Math.floor((Date.now() - timestamp * 1000) / (1000 * 60 * 60 * 24))

  if (differenceInDays === 0) return 'Today'
  if (differenceInDays === 1) return 'Yesterday'

  if (differenceInDays > 365) {
    const years = Math.floor(differenceInDays / 365)
    return `${years} ${years > 1 ? 'years' : 'year'} ago`
  }

  if (differenceInDays > 30) {
    const months = Math.floor(differenceInDays / 30)
    return `${months} ${months > 1 ? 'months' : 'month'} ago`
  }

  return `${differenceInDays} days ago`
}

const getListSignature = (history) =>
  `${history.current}:${history.items.map(item => `${item.id}:${item.name}`).join('|')}`

let lastListSignature = ''

export const setHistory = (history) => {
  const listSignature = getListSignature(history)

  if (listSignature === lastListSignature) return

  lastListSignature = listSignature
  $historyList.innerHTML = ''
  const sortedItems = [...history.items].sort((a, b) => b.timestamp - a.timestamp)
  const groupedItems = {}

  for (const item of sortedItems) {
    const key = getRelativeDateLabel(item.timestamp)
    groupedItems[key] = groupedItems[key] || []
    groupedItems[key].push(item)
  }

  for (const [key, value] of Object.entries(groupedItems)) {
    const $group = document.createElement('div')
    $group.classList.add('group')
    const $title = document.createElement('h4')
    $title.textContent = key

    $group.appendChild($title)
    value.forEach(({ id, name }) => {
      const $li = createListItem({ id, name, isActive: history.current === id })
      $group.appendChild($li)
    })

    $historyList.appendChild($group)
  }
}
