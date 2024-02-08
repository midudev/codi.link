import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

import { DEFAULT_INITIAL_SETTINGS } from './constants/initial-settings'

const useStore = createStore(
  persist(
    (set, get) => ({
      ...DEFAULT_INITIAL_SETTINGS,
      updateSettings: ({ key, value }) => {
        set({ [key]: value })
      }
    }),
    { name: 'appInitialState' }
  )
)

export const { getState, setState, subscribe } = useStore
