import create from 'zustand/vanilla'
import sillyname from 'sillyname'
import { toggleSessionID } from './session/dom'

const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key))
const setLocalStorage = (key, value) =>
  window.localStorage.setItem(key, JSON.stringify(value))

const appInitialState = getLocalStorage('appInitialState') || {
  fontSize: 18,
  lineNumbers: 'off',
  minimap: false,
  theme: 'vs-dark',
  wordWrap: 'on',
  fontLigatures: 'on',
  preserveGrid: true,
  fontFamily: "'Cascadia Code PL', 'Menlo', 'Monaco', 'Courier New', 'monospace'",
  userName: sillyname(),
  streamerMode: false
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
