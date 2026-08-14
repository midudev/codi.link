import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const useHistoryStore = createStore(
  persist(
    (set, get) => ({
      history: {
        current: null,
        items: []
      },
      updateHistory: ({ key, value }) => {
        set({ history: { ...get().history, [key]: value } })
      },
      updateHistoryItem: ({ value }) => {
        const id = get().history.current || genId()
        const currentHistory = get().history.items
        const item = currentHistory.find(item => item.id === id)
        const alreadyExists = !!item
        const timestamp = new Date().getTime() / 1000

        if (alreadyExists) {
          if (value === item.value) return

          set({
            history: {
              current: id,
              items: currentHistory.map(item =>
                item.id === id
                  ? { ...item, value, timestamp }
                  : item
              )
            }
          })
        } else {
          const instanceName = 'Untitled'
          const regex = new RegExp(`^${instanceName}(\\(\\d+\\))?$`)
          const newNameItems = currentHistory.filter(item => regex.test(item.name))
          const itemName = newNameItems.length > 0 ? `${instanceName}(${newNameItems.length})` : instanceName
          set({ history: { current: id, items: [...currentHistory, { id, name: itemName, value, timestamp }] } })
        }
      },
      removeHistoryItem: ({ id }) => {
        const { current, items } = get().history
        set({
          history:
          {
            current: current === id
              ? null
              : current,
            items: items.filter(item => item.id !== id)
          }
        })
      },
      updateHistoryItemName: ({ id, prevName, newName }) => {
        const prevNameLower = prevName.toLocaleLowerCase()
        const newNameLower = newName.toLocaleLowerCase()

        if (!newName || prevNameLower === newNameLower) return

        const { items, ...history } = get().history
        const regex = new RegExp(`^${newNameLower}(\\(\\d+\\))?$`)
        const newNameItems = items.filter(item => item.id !== id && regex.test(item.name.toLocaleLowerCase()))
        const alreadyExists = newNameItems.length > 0

        let name
        if (alreadyExists) {
          const existingNumbers = newNameItems
            .map(item => {
              const match = item.name.toLocaleLowerCase().match(/\((\d+)\)$/)
              return match ? parseInt(match[1], 10) : 0
            })
            .sort((a, b) => a - b)
          const highestNumber = existingNumbers.length > 0 ? existingNumbers[existingNumbers.length - 1] : 0
          name = `${newName}(${highestNumber + 1})`
        } else {
          name = newName
        }

        set({
          history: {
            ...history,
            items: items.map(item =>
              item.id === id
                ? { ...item, name }
                : item)
          }
        })
      },
      clearHistory: () => set({ history: { current: null, items: [] } })
    }),
    { name: 'history', getHistory: () => window.localStorage.getItem('history') }
  )
)

export const {
  getState: getHistoryState,
  setState: setHistoryState,
  subscribe: subscribeHistory
} = useHistoryStore
