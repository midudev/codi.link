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
  editors: {
    html: null,
    css: null,
    js: null,
    setEditors: ({ html, css, js }) => {
      set(state => {
        const editors = { html, css, js }
        return {
          ...state,
          editors
        }
      })
    }
  },
  settings: {
    ...appInitialState,
    updateSettings: ({ key, value }) => {
      if (key === 'streamerMode') toggleSessionID(value)
      set(state => {
        setLocalStorage('appInitialState', {
          ...state.settings,
          [key]: value
        })

        const settings = {
          ...state.settings,
          [key]: value
        }

        return {
          ...state,
          settings
        }
      })
    }
  }
}))

toggleSessionID(useStore.getState().settings.streamerMode)

export const {
  getState,
  setState,
  subscribe,
  destroy
} = useStore
