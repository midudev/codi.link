import create from 'zustand/vanilla'
import { toggleSessionID } from './session/dom'

import { DEFAULT_INITIAL_SETTINGS } from './constants/initial-settings'

const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key))
const setLocalStorage = (key, value) =>
  window.localStorage.setItem(key, JSON.stringify(value))

const appInitialState = {
  ...DEFAULT_INITIAL_SETTINGS,
  ...getLocalStorage('appInitialState')
}

const useStore = create((set, get) => ({
  ...appInitialState,
  updateSettings: ({ key, value }) => {
    if (key === 'streamerMode') toggleSessionID(value)
    set(state => {
      setLocalStorage('appInitialState', {
        ...state,
        [key]: value
      })

      return { [key]: value }
    })
  }
}))

export const editorsState = create((set, get) => ({
  html: null,
  css: null,
  js: null,
  setEditors: ({ html, css, js }) => {
    set(state => {
      return { html, css, js }
    })
  }
}))

toggleSessionID(useStore.getState().streamerMode)

export const {
  getState,
  setState,
  subscribe,
  destroy
} = useStore
