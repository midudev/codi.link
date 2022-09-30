import { persist } from 'zustand/middleware'
import create from 'zustand/vanilla'

import { DEFAULT_INITIAL_SETTINGS } from './constants/initial-settings'

const useStore = create(
  persist(
    (set, get) => ({
      ...DEFAULT_INITIAL_SETTINGS,
      updateSettings: ({ key, value }) => {
        set({ [key]: value })
      }
    }),
    { name: 'appInitialState', getStorage: () => window.localStorage }
  )
)

export const { getState, setState, subscribe, destroy } = useStore
