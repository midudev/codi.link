import create from 'zustand/vanilla'
import { getLocalStorage, setLocalStorage } from './utils/useLocalStorage'

import { DEFAULT_APP_SETTINGS, DEFAULT_EDITOR_SETTINGS } from './constants/initial-settings'

const updateStore = ({ key, value, set, storeName }) => {
  set(state => {
    setLocalStorage(storeName, {
      ...state,
      [key]: value
    })

    return { [key]: value }
  })
}

const editorsInitialState = { ...DEFAULT_EDITOR_SETTINGS, ...getLocalStorage('editorsInitialState') }

export const useEditorsStore = create((set, get) => ({
  ...editorsInitialState,
  updateStore: ({ key, value }) => updateStore({ key, value, set, storeName: 'editorsInitialState' })
}))

const settingsInitialState = { ...DEFAULT_APP_SETTINGS, ...getLocalStorage('settingsInitialState') }

export const useSettingsStore = create((set, get) => ({
  ...settingsInitialState,
  updateStore: ({ key, value }) => updateStore({ key, value, set, storeName: 'settingsInitialState' })
}))
