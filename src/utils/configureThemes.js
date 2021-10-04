
import * as monaco from 'monaco-editor-core'
import strip from 'strip-comments'

import * as themes from '../public/assets/themes'
import { subscribe, getState } from '../state'
import { $ } from '../utils/dom'

const themeSelect = $('.select select[data-for="theme"]')

const defineTheme = ({ name, config }) => {
  try {
    monaco.editor.defineTheme(name, { ...window.convertTheme(config), inherit: true })
    const option = document.createElement('option')
    option.text = name
    option.value = name
    themeSelect.appendChild(option)
  } catch (error) {
    window.alert('Theme format is not valid')
  }
}

export default function configureThemes () {
  configureCustomTheme(getState().customTheme)
  Object.entries(themes).forEach(([name, config]) => {
    defineTheme({ name, config })
  })
}

export const configureCustomTheme = customTheme => {
  if (!customTheme) {
    // iterate themeSelect, remove option with value "Custom"
    const option = themeSelect.querySelector('option[value="Custom Theme"]')
    option && themeSelect.removeChild(option)
    return
  }

  const parsedTheme = strip(customTheme.replaceAll('null', '""')).replaceAll('\n\t\t', '').replace(',\n\t}', '}')
  const jsonTheme = JSON.parse(parsedTheme)

  if (customTheme) {
    defineTheme({
      name: 'Custom',
      config: jsonTheme
    })
  }
}

subscribe(configureCustomTheme, state => state.customTheme)
