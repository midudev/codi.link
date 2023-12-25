import { useEffect, useState } from 'preact/hooks'
import { store } from '../../state'
import { useStore } from 'zustand'

export const DEFAULT_THEMES = {
  'vs-dark': 'Default Dark',
  vs: 'Default Light',
  'hc-black': 'Default High Contrast',
  'hc-light': 'Default High Contrast Light'
}

export function SettingsThemes () {
  const updateSettings = useStore(store, state => state.updateSettings)
  const [themes, setThemes] = useState(DEFAULT_THEMES)

  useEffect(() => {
    fetch('/assets/themes/themelist.json')
      .then(res => res.json())
      .then(res => {
        setThemes(prevState => ({ ...prevState, ...res }))
      })
  }, [])

  const createHandleClick = (optionValue) => () => {
    console.log({ optionValue })

    const defaultIndex = Object
      .values(DEFAULT_THEMES)
      .findIndex(theme => theme === optionValue)

    console.log({ defaultIndex })

    const isDefault = defaultIndex !== -1

    const value = isDefault
      ? Object.keys(DEFAULT_THEMES)[defaultIndex]
      : optionValue

    console.log({ value })

    updateSettings({ key: 'theme', value })
  }

  return (
    <select name='theme'>
      {
        Object.entries(themes).map(([key, value]) => {
          return (
            <option
              onClick={createHandleClick(value)}
              key={key}
              value={value}
            >{value}
            </option>
          )
        })
      }
    </select>
  )
}
