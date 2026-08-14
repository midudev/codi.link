import { $ } from './utils/dom.js'
import { EVENTS, eventBus } from './events-controller.js'
import { getHistoryState } from './history-store.js'

export { getHistoryState, setHistoryState, subscribeHistory } from './history-store.js'

const $historyList = $('#history .history-list')

const HISTORY_ICONS = {
  remove: `<svg width="24" height="24" fill='none' viewBox='0 0 24 24'>
    <path d='M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75Zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5ZM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75Zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75Zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25Z' fill='currentColor' />
    </svg>`,
  edit: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path d="M21.03 2.97a3.578 3.578 0 0 1 0 5.06L9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L15.97 2.97a3.578 3.578 0 0 1 5.06 0ZM15 6.06 5.062 16a.75.75 0 0 0-.193.333l-1.05 3.85 3.85-1.05A.75.75 0 0 0 8 18.938L17.94 9 15 6.06Zm2.03-2.03-.97.97L19 7.94l.97-.97a2.079 2.079 0 0 0-2.94-2.94Z" fill="currentColor"/>
    </svg>`
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
