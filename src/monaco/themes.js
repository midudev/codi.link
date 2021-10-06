
import { monaco } from '.'
import strip from 'strip-comments'

import * as themes from '../assets/themes'
import { subscribe, getState } from '../state'
import { $, updateSelectValue } from '../utils/dom'

const themeSelect = $('.select select[data-for="theme"]')

const convertTheme = (theme) => {
  const returnTheme = {
    inherit: false,
    base: 'vs-dark',
    colors: theme.colors,
    rules: [],
    encodedTokensColors: []
  }
  theme.tokenColors.forEach((color) => {
    if (typeof color.scope === 'string') {
      const split = color.scope.split(',')
      if (split.length > 1) {
        color.scope = split
        evalAsArray()
        return
      }
      returnTheme.rules.push(Object.assign({}, color.settings, {
        // token: color.scope.replace(/\s/g, '')
        token: color.scope
      }))
      return
    }
    evalAsArray()
    function evalAsArray () {
      if (color.scope) {
        color.scope.forEach((scope) => {
          returnTheme.rules.push(Object.assign({}, color.settings, {
            token: scope
          }))
        })
      }
    }
  })
  returnTheme.rules.push({
    token: '',
    foreground: returnTheme.colors['editor.foreground']
  })
  return returnTheme
}

const defineTheme = ({ name, config }) => {
  try {
    monaco.editor.defineTheme(name, convertTheme(config))
    const option = document.createElement('option')
    option.text = name
    option.value = name
    themeSelect.appendChild(option)
  } catch (error) {
    window.alert('Theme format is not valid')
  }
}

export default async function configureThemes () {
  const { customTheme, theme } = getState()
  configureCustomTheme(customTheme)
  Object.entries(themes).forEach(([name, config]) => {
    defineTheme({ name, config })
  })
  updateSelectValue(themeSelect, theme)
  await import('./languages')
}

export const configureCustomTheme = customTheme => {
  if (!customTheme) {
    // iterate themeSelect, remove option with value "Custom"
    const option = themeSelect.querySelector('option[value="Custom Theme"]')
    option && themeSelect.removeChild(option)
    return
  }

  const parsedTheme = strip(customTheme.replaceAll('null', '""')).replaceAll('\n\t\t', '').replace(',\n\t}', '}')
  const jsonTheme = JSON.parse(parsedTheme || null)

  if (jsonTheme) {
    defineTheme({
      name: 'Custom',
      config: jsonTheme
    })
  }
}

subscribe(configureCustomTheme, state => state.customTheme)
