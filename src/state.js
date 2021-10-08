import create from 'zustand/vanilla'

const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key))
const setLocalStorage = (key, value) =>
  window.localStorage.setItem(key, JSON.stringify(value))
const updateStore = ({ key, value, set, storeName }) => {
  set(state => {
    setLocalStorage(storeName, {
      ...state,
      [key]: value
    })

    return { [key]: value }
  })
}

const editorsInitialState = getLocalStorage('editorsInitialState') || {
  fontSize: 18,
  lineNumbers: 'off',
  minimap: false,
  theme: 'vs-dark',
  wordWrap: 'on',
  fontLigatures: 'on',
  fontFamily: "'Cascadia Code PL', 'Menlo', 'Monaco', 'Courier New', 'monospace'"
}

export const useEditorsStore = create((set, get) => ({
  ...editorsInitialState,
  updateStore: ({ key, value }) => updateStore({ key, value, set, storeName: 'editorsInitialState' })
}))

const settingsInitialState = getLocalStorage('settingsInitialState') || { preserveGrid: true }

export const useSettingsStore = create((set, get) => ({
  ...settingsInitialState,
  updateStore: ({ key, value }) => updateStore({ key, value, set, storeName: 'settingsInitialState' })
}))
